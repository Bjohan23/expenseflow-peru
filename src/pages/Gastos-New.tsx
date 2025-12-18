import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { ArrowLeft, Upload, DollarSign } from 'lucide-react';
import { useCreateExpense, useExpenseCategoriesSelector, useUploadExpenseEvidence } from '@/hooks/useExpenses';
import { useAuthRoles } from '@/contexts/AuthContext';
import { CreateExpensePayload, Currency } from '@/types/api';

// Form schema using the API types
const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Amount must be a positive number'
  ),
  currency: z.enum(['PEN', 'USD', 'EUR']).default('PEN'),
  exchangeRate: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  categoryId: z.string().min(1, 'Category is required'),
  companyId: z.string().min(1, 'Company is required'),
  branchId: z.string().optional(),
  observations: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

const GastosNew: React.FC = () => {
  const navigate = useNavigate();
  const { canCreate } = useAuthRoles();

  const createExpense = useCreateExpense();
  const { data: categories, isLoading: categoriesLoading } = useExpenseCategoriesSelector();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: '',
      currency: 'PEN',
      exchangeRate: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      companyId: '',
      branchId: '',
      observations: '',
    },
  });

  // Redirect if user doesn't have permission
  React.useEffect(() => {
    if (!canCreate) {
      toast.error('You do not have permission to create expenses');
      navigate('/gastos');
      return;
    }
  }, [canCreate, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (expenseId: string) => {
    const uploadPromises = files.map(async (file) => {
      try {
        setUploadingFiles(prev => new Set(prev).add(file.name));

        // You'll need to implement this function in your hooks
        const response = await fetch(`/api/v1/treasury/gastos/${expenseId}/evidencias/add/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: new FormData().append('file', file),
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        return await response.json();
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    });

    try {
      await Promise.all(uploadPromises);
      toast.success('All files uploaded successfully');
    } catch (error) {
      toast.error('Some files failed to upload');
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      // Convert form data to API payload
      const payload: CreateExpensePayload = {
        title: data.title,
        description: data.description,
        amount: parseFloat(data.amount),
        currency: data.currency as Currency,
        exchangeRate: data.exchangeRate ? parseFloat(data.exchangeRate) : undefined,
        date: new Date(data.date).toISOString(),
        categoryId: data.categoryId,
        companyId: data.companyId,
        branchId: data.branchId || undefined,
        observations: data.observations,
        evidence: files.length > 0 ? files : undefined,
      };

      // Create expense
      const result = await createExpense.mutateAsync(payload);

      // Upload files if any
      if (files.length > 0 && result.id) {
        await uploadFiles(result.id);
      }

      // Navigate to expense detail
      navigate(`/gastos/${result.id}`);

    } catch (error) {
      console.error('Error creating expense:', error);
      // Error is already handled by the mutation hook
    }
  };

  if (!canCreate) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/gastos')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expenses
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Create New Expense
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a new expense record.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Expense title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PEN">PEN - Peruvian Sol</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Exchange Rate (conditional) */}
                  {form.watch('currency') !== 'PEN' && (
                    <FormField
                      control={form.control}
                      name="exchangeRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exchange Rate</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Exchange rate to PEN"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            1 {form.watch('currency')} = ? PEN
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Company ID (placeholder - should come from user context) */}
                  <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Company ID"
                            {...field}
                            disabled={true}
                            value={field.value || 'User company will be set here'}
                          />
                        </FormControl>
                        <FormDescription>
                          Company will be set based on user permissions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the expense..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Observations */}
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observations</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional observations or notes..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload */}
                <div className="space-y-3">
                  <FormLabel>Evidence/Attachments</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload files</span>
                          <input
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP, PDF up to 10MB each
                      </p>
                    </div>

                    {/* File list */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <div className="flex items-center gap-2">
                              {uploadingFiles.has(file.name) && (
                                <span className="text-xs text-blue-600">Uploading...</span>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/gastos')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createExpense.isPending}
                  >
                    {createExpense.isPending ? 'Creating...' : 'Create Expense'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GastosNew;