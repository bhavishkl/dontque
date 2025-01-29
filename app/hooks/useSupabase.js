'use client';

import useSWR from 'swr';

const fetchData = async (key, { table, action, data, filters }) => {
  const response = await fetch('/api/supabase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ table, action, data, filters }),
  });

  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result;
};

export function useSupabase(table, { action = 'select', data = null, filters = null, key = null }) {
  const cacheKey = key || `${table}-${action}-${JSON.stringify(data)}-${JSON.stringify(filters)}`;

  const { data: result, error, mutate } = useSWR(
    cacheKey,
    () => fetchData(cacheKey, { table, action, data, filters }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const mutateData = async (newData, options = {}) => {
    try {
      const response = await fetch('/api/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table,
          action: options.action || 'update',
          data: newData,
          filters: options.filters || filters,
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      // Revalidate the data
      mutate();
      return result;
    } catch (error) {
      console.error('Error mutating data:', error);
      throw error;
    }
  };

  return {
    data: result,
    error,
    isLoading: !error && !result,
    mutate: mutateData,
  };
}
