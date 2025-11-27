import { useState, useMemo } from "react";

interface UseTableFilterProps<T> {
  data: T[];
  searchFields: (keyof T)[];
}

export function useTableFilter<T>({ data, searchFields }: UseTableFilterProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;

        // Handle nested objects (e.g., empresa.razon_social)
        if (typeof value === "object" && value !== null) {
          return Object.values(value).some((nestedValue) => {
            if (nestedValue === null || nestedValue === undefined) return false;
            return String(nestedValue).toLowerCase().includes(lowerSearchTerm);
          });
        }

        return String(value).toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
}
