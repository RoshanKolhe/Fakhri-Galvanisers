// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetProcessess() {
  const URL = endpoints.processes.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshProcessess = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    processess: data || [],
    processessLoading: isLoading,
    processessError: error,
    processessValidating: isValidating,
    processessEmpty: !isLoading && !data?.length,
    refreshProcessess, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetProcesses(processesId) {
  const URL = processesId ? [endpoints.processes.details(processesId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      processes: data,
      processesLoading: isLoading,
      processesError: error,
      processesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProcessessWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.processes.filterList(filter);
  } else {
    URL = endpoints.processes.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterProcessess = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredProcessess: data || [],
    filteredProcessessLoading: isLoading,
    filteredProcessessError: error,
    filteredProcessessValidating: isValidating,
    filteredProcessessEmpty: !isLoading && !data?.length,
    refreshFilterProcessess, // Include the refresh function separately
  };
}
