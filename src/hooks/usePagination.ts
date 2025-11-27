import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  initialPageSize?: number;
}

export function usePagination<T>({ data, initialPageSize = 10 }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems: data.length,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  };
}
