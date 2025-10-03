// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetItemsMasters(filterParams) {
  const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
  const URL = queryString ? `${endpoints.itemsMaster.list}?${queryString}` : endpoints.itemsMaster.list;


  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshItemsMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    itemsMasters: data?.data || [],
    totalCount: data?.count || {
      total: 0,
      activeTotal: 0,
      inActiveTotal: 0,
    },
    itemsMastersLoading: isLoading,
    itemsMastersError: error,
    itemsMastersValidating: isValidating,
    itemsMastersEmpty: !isLoading && (!data?.data, !data?.data?.length === 0),
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
    filteredItemsMasters: data?.data || [],
    filteredItemsMastersLoading: isLoading,
    filteredItemsMastersError: error,
    filteredItemsMastersValidating: isValidating,
    filteredItemsMastersEmpty: !isLoading && !data?.data?.length,
    refreshFilterItemsMasters, // Include the refresh function separately
  };
}

