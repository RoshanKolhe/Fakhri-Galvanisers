// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetInquiries() {
  const URL = endpoints.inquiry.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshInquiries = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    inquiries: data || [],
    inquiriesLoading: isLoading,
    inquiriesError: error,
    inquiriesValidating: isValidating,
    inquiriesEmpty: !isLoading && !data?.length,
    refreshInquiries, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetInquiry(inquiryId) {
  const URL = inquiryId ? [endpoints.inquiry.details(inquiryId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      inquiry: data,
      inquiryLoading: isLoading,
      inquiryError: error,
      inquiryValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetInquiriesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.inquiry.filterList(filter);
  } else {
    URL = endpoints.inquiry.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterInquiries = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredInquiries: data || [],
    filteredInquiriesLoading: isLoading,
    filteredInquiriesError: error,
    filteredInquiriesValidating: isValidating,
    filteredInquiriesEmpty: !isLoading && !data?.length,
    refreshFilterInquiries, // Include the refresh function separately
  };
}
