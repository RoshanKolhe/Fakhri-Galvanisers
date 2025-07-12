// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetItemsMasters() {
  const URL = endpoints.itemsMaster.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshItemsMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    itemsMasters: data || [],
    itemsMastersLoading: isLoading,
    itemsMastersError: error,
    itemsMastersValidating: isValidating,
    itemsMastersEmpty: !isLoading && !data?.length,
    refreshItemsMasters, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetItemsMaster(itemMasterId) {
  const URL = itemMasterId ? [endpoints.itemsMaster.details(itemMasterId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      itemsMaster: data,
      itemsMasterLoading: isLoading,
      itemsMasterError: error,
      itemsMasterValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetItemsMastersWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.itemsMaster.filterList(filter);
  } else {
    URL = endpoints.itemsMaster.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterItemsMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredItemsMasters: data || [],
    filteredItemsMastersLoading: isLoading,
    filteredItemsMastersError: error,
    filteredItemsMastersValidating: isValidating,
    filteredItemsMastersEmpty: !isLoading && !data?.length,
    refreshFilterItemsMasters, // Include the refresh function separately
  };
}

