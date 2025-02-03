// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetQuotations() {
  const URL = endpoints.quotation.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshQuotations = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    quotations: data || [],
    quotationsLoading: isLoading,
    quotationsError: error,
    quotationsValidating: isValidating,
    quotationsEmpty: !isLoading && !data?.length,
    refreshQuotations, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetQuotation(quotationId) {
  const URL = quotationId ? [endpoints.quotation.details(quotationId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      quotation: data,
      quotationLoading: isLoading,
      quotationError: error,
      quotationValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetQuotationsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.quotation.filterList(filter);
  } else {
    URL = endpoints.quotation.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterQuotations = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredQuotations: data || [],
    filteredQuotationsLoading: isLoading,
    filteredQuotationsError: error,
    filteredQuotationsValidating: isValidating,
    filteredQuotationsEmpty: !isLoading && !data?.length,
    refreshFilterQuotations, // Include the refresh function separately
  };
}

export function useGetDashboardCounts() {
  const URL = endpoints.quotation.getDashboradCounts;

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
