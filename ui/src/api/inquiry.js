// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetInquiries(filterParams) {
        const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.inquiry.list}?${queryString}` : endpoints.inquiry.list;


  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshInquiries = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    inquiries: data?.data || [],
    totalCount: data?.count || {
        total: 0,
         incompleteTotal: 0,
      completeTotal:0,
      convertedTotal:0
    
      },
    inquiriesLoading: isLoading,
    inquiriesError: error,
    inquiriesValidating: isValidating,
    inquiriesEmpty: !isLoading && (!data?.data || data?.data?.length === 0),
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
    filteredInquiries: data?.data || [],
    filteredInquiriesLoading: isLoading,
    filteredInquiriesError: error,
    filteredInquiriesValidating: isValidating,
    filteredInquiriesEmpty: !isLoading && !data?.data?.length,
    refreshFilterInquiries, // Include the refresh function separately
  };
}
