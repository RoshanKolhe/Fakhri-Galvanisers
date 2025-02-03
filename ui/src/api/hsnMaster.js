// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetHsnMasters() {
  const URL = endpoints.hsnMaster.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshHsnMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    hsnMasters: data || [],
    hsnMastersLoading: isLoading,
    hsnMastersError: error,
    hsnMastersValidating: isValidating,
    hsnMastersEmpty: !isLoading && !data?.length,
    refreshHsnMasters, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetHsnMaster(hsnMasterId) {
  const URL = hsnMasterId ? [endpoints.hsnMaster.details(hsnMasterId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      hsnMaster: data,
      hsnMasterLoading: isLoading,
      hsnMasterError: error,
      hsnMasterValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetHsnMastersWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.hsnMaster.filterList(filter);
  } else {
    URL = endpoints.hsnMaster.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterHsnMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredHsnMasters: data || [],
    filteredHsnMastersLoading: isLoading,
    filteredHsnMastersError: error,
    filteredHsnMastersValidating: isValidating,
    filteredHsnMastersEmpty: !isLoading && !data?.length,
    refreshFilterHsnMasters, // Include the refresh function separately
  };
}

export function useGetDashboardCounts() {
  const URL = endpoints.hsnMaster.getDashboradCounts;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshDashboardCounts = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    dashboardCounts: data || [],
    isLoading,
    error,
    isValidating,
    refreshDashboardCounts,
  };
}
