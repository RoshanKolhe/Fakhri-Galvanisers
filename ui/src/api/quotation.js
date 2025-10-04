// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetQuotations(filterParams) {
          const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.quotation.list}?${queryString}` : endpoints.quotation.list;


  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshQuotations = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    quotations: data?.data || [],
    totalcount: data?.count ||{total:0,
    approvedTotal:0,
    pendingApprovalTotal:0,
    rejectedTotal:0,
    createdTotal:0,
  },
    quotationsLoading: isLoading,
    quotationsError: error,
    quotationsValidating: isValidating,
    quotationsEmpty:  !isLoading && (!data?.data || data?.data?.length === 0),
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
    filteredQuotations: data?.data || [],
     quotationCount: data?.count || {},
        filteredQuotationsLoading: isLoading,
    filteredQuotationsError: error,
    filteredQuotationsValidating: isValidating,
    filteredQuotationsEmpty: !isLoading && !data?.data?.length,
    refreshFilterQuotations, // Include the refresh function separately
  };
}
