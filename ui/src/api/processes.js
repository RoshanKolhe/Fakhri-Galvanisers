// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetProcessess(filterParams) {
    const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.processes.list}?${queryString}` : endpoints.processes.list;
 

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshProcessess = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    processess: data?.data || [],
    totalCount: data?.count ||{ total:0,
     activeTotal:0,
        inActiveTotal:0
  },
    processessLoading: isLoading,
    processessError: error,
    processessValidating: isValidating,
    processessEmpty: !isLoading &&(!data?.data ||  !data?.data?.length === 0),
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
    filteredProcessess: data?.data || [],
    filteredProcessessLoading: isLoading,
    filteredProcessessError: error,
    filteredProcessessValidating: isValidating,
    filteredProcessessEmpty: !isLoading && !data?.length,
    refreshFilterProcessess, // Include the refresh function separately
  };
}
