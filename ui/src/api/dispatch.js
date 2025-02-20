// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetDispatches() {
  const URL = endpoints.dispatch.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDispatches = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dispatches: data || [],
    dispatchesLoading: isLoading,
    dispatchesError: error,
    dispatchesValidating: isValidating,
    dispatchesEmpty: !isLoading && !data?.length,
    refreshDispatches, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetDispatch(dispatchId) {
  const URL = dispatchId ? [endpoints.dispatch.details(dispatchId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      dispatch: data,
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
    filteredDispatches: data || [],
    filteredDispatchesLoading: isLoading,
    filteredDispatchesError: error,
    filteredDispatchesValidating: isValidating,
    filteredDispatchesEmpty: !isLoading && !data?.length,
    refreshFilterDispatches, // Include the refresh function separately
  };
}

