// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetPayments(filterParams) {
          const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.payment.list}?${queryString}` : endpoints.payment.list;



  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshPayments = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    payments: data?.data || [],
    totalCount: data?.count || {total: 0,
      paidTotal:0,
      pendingTotal:0,
      overdueTotal:0,
      pendingApprovalTotal:0,
      requestReuploadTotal:0,
    },
    paymentsLoading: isLoading,
    paymentsError: error,
    paymentsValidating: isValidating,
    paymentsEmpty:!isLoading && (!data?.data || data?.data?.length === 0),
    refreshPayments, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetPayment(paymentId) {
  const URL = paymentId ? [endpoints.payment.details(paymentId)] : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshPayment = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    payment: data?.data,
    paymentLoading: isLoading,
    paymentError: error,
    paymentValidating: isValidating,
    refreshPayment,
  };
}

// ----------------------------------------------------------------------

export function useGetPaymentsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.payment.filterList(filter);
  } else {
    URL = endpoints.payment.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterPayments = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredPayments: data?.data || [],
    filteredPaymentsLoading: isLoading,
    filteredPaymentsError: error,
    filteredPaymentsValidating: isValidating,
    filteredPaymentsEmpty: !isLoading && !data?.data?.length,
    refreshFilterPayments, // Include the refresh function separately
  };
}
