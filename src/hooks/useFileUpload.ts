import { useState, useCallback } from 'react';
import { AxiosProgressEvent } from 'axios';

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  file: File | null;
  url: string | null;
}

export interface UseFileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [state, setState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    file: null,
    url: null,
  });

  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    onSuccess,
    onError,
    onProgress,
  } = options;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes.map(type => {
        switch (type) {
          case 'image/jpeg': return '.jpg, .jpeg';
          case 'image/png': return '.png';
          case 'image/webp': return '.webp';
          case 'application/pdf': return '.pdf';
          default: return type;
        }
      }).join(', ');
      return `Only ${allowedExtensions} files are allowed`;
    }

    return null;
  }, [maxSize, allowedTypes]);

  const uploadFile = useCallback(async (
    file: File,
    uploadFunction: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => Promise<any>
  ) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      const error = validationError;
      setState(prev => ({ ...prev, uploading: false, error }));
      onError?.(error);
      throw new Error(error);
    }

    // Reset state and start upload
    setState({
      uploading: true,
      progress: 0,
      error: null,
      file,
      url: null,
    });

    try {
      const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;

        setState(prev => ({ ...prev, progress }));
        onProgress?.(progress);
      };

      const response = await uploadFunction(file, onUploadProgress);

      setState({
        uploading: false,
        progress: 100,
        error: null,
        file,
        url: response.fileUrl || response.url || null,
      });

      onSuccess?.(response);
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({
        ...prev,
        uploading: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
      throw error;
    }
  }, [validateFile, onSuccess, onError, onProgress]);

  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      file: null,
      url: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    uploadFile,
    reset,
    clearError,
    validateFile: (file: File) => validateFile(file),
  };
};

// Specific hook for expense evidence upload
export const useExpenseEvidenceUpload = (expenseId: string) => {
  const { uploadFile, ...fileUploadState } = useFileUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
  });

  const { uploadExpenseEvidence } = useExpensesOperations();

  const uploadExpenseFile = useCallback(async (file: File) => {
    return uploadFile(file, (file, onProgress) =>
      uploadExpenseEvidence.mutateAsync({
        id: expenseId,
        file,
      })
    );
  }, [uploadFile, uploadExpenseEvidence, expenseId]);

  return {
    ...fileUploadState,
    uploadExpenseFile,
  };
};

// Hook for multiple file uploads
export const useMultipleFileUpload = (options: UseFileUploadOptions = {}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map());
  const [overallProgress, setOverallProgress] = useState(0);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);

    // Initialize upload states for new files
    const initialStates = new Map(uploadStates);
    newFiles.forEach(file => {
      initialStates.set(file.name + file.size, {
        uploading: false,
        progress: 0,
        error: null,
        file,
        url: null,
      });
    });
    setUploadStates(initialStates);
  }, [uploadStates]);

  const removeFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(fileName);
      return newStates;
    });
  }, []);

  const uploadFiles = useCallback(async (
    uploadFunction: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => Promise<any>
  ) => {
    let completedUploads = 0;

    const uploadPromises = files.map(async (file) => {
      const stateKey = file.name + file.size;

      // Set uploading state
      setUploadStates(prev => {
        const newStates = new Map(prev);
        newStates.set(stateKey, {
          ...newStates.get(stateKey)!,
          uploading: true,
          progress: 0,
          error: null,
        });
        return newStates;
      });

      try {
        const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;

          setUploadStates(prev => {
            const newStates = new Map(prev);
            newStates.set(stateKey, {
              ...newStates.get(stateKey)!,
              progress,
            });
            return newStates;
          });
        };

        const response = await uploadFunction(file, onUploadProgress);

        // Update state with success
        setUploadStates(prev => {
          const newStates = new Map(prev);
          newStates.set(stateKey, {
            uploading: false,
            progress: 100,
            error: null,
            file,
            url: response.fileUrl || response.url || null,
          });
          return newStates;
        });

        completedUploads++;
        setOverallProgress(Math.round((completedUploads / files.length) * 100));

        return { file, response, success: true };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';

        // Update state with error
        setUploadStates(prev => {
          const newStates = new Map(prev);
          newStates.set(stateKey, {
            uploading: false,
            progress: 0,
            error: errorMessage,
            file,
            url: null,
          });
          return newStates;
        });

        completedUploads++;
        setOverallProgress(Math.round((completedUploads / files.length) * 100));

        return { file, error: errorMessage, success: false };
      }
    });

    const results = await Promise.all(uploadPromises);
    return results;
  }, [files]);

  const reset = useCallback(() => {
    setFiles([]);
    setUploadStates(new Map());
    setOverallProgress(0);
  }, []);

  return {
    files,
    uploadStates: Array.from(uploadStates.entries()),
    overallProgress,
    addFiles,
    removeFile,
    uploadFiles,
    reset,
    hasFiles: files.length > 0,
    allUploaded: files.length > 0 && Array.from(uploadStates.values()).every(state => !state.uploading),
    hasErrors: Array.from(uploadStates.values()).some(state => !!state.error),
  };
};

// Import needed hooks
import { useExpensesOperations } from './useExpenses';