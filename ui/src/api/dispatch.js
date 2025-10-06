// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetDispatches(filterParams) {
      const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.dispatch.list}?${queryString}` : endpoints.dispatch.list;




  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDispatches = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dispatches: data?.data || [],
    totalcount: data?.count ||{total: 0,
pendingTotal:0,
documentsUploadedTotal:0,
completedTotal:0,
  },
    dispatchesLoading: isLoading,
    dispatchesError: error,
    dispatchesValidating: isValidating,
    dispatchesEmpty: !isLoading && (!data?.data || !data?.data?.length=== 0),
    refreshDispatches, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetDispatch(dispatchId) {
  const URL = dispatchId ? [endpoints.dispatch.details(dispatchId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      dispatch: data|| [],
      dispatchLoading: isLoading,
      dispatchError: error,
      dispatchValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetDispatchesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.dispatch.filterList(filter);
  } else {
    URL = endpoints.dispatch.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterDispatches = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredDispatches: data?.data || [],
    filteredDispatchesLoading: isLoading,
    filteredDispatchesError: error,
    filteredDispatchesValidating: isValidating,
    filteredDispatchesEmpty: !isLoading && !data?.data?.length,
    refreshFilterDispatches, // Include the refresh function separately
  };
}

