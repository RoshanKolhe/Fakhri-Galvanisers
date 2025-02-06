// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetChallans() {
  const URL = endpoints.challan.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshChallans = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    challans: data || [],
    challansLoading: isLoading,
    challansError: error,
    challansValidating: isValidating,
    challansEmpty: !isLoading && !data?.length,
    refreshChallans, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetChallan(challanId) {
  const URL = challanId ? [endpoints.challan.details(challanId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      challan: data,
      challanLoading: isLoading,
      challanError: error,
      challanValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetChallansWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.challan.filterList(filter);
  } else {
    URL = endpoints.challan.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterChallans = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredChallans: data || [],
    filteredChallansLoading: isLoading,
    filteredChallansError: error,
    filteredChallansValidating: isValidating,
    filteredChallansEmpty: !isLoading && !data?.length,
    refreshFilterChallans, // Include the refresh function separately
  };
}

export function useGetDashboardCounts() {
  const URL = endpoints.challan.getDashboradCounts;

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
