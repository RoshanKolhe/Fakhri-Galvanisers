// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetPayments() {
  const URL = endpoints.payment.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshPayments = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    payments: data || [],
    paymentsLoading: isLoading,
    paymentsError: error,
    paymentsValidating: isValidating,
    paymentsEmpty: !isLoading && !data?.length,
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
    payment: data,
    paymentLoading: isLoading,
    paymentError: error,
    paymentValidating: isValidating,
    refreshPayment,
  };
}

// ----------------------------------------------------------------------

export function useGetPaymentsWithFilter(filter) {
  console.log(filter);
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
    filteredPayments: data || [],
    filteredPaymentsLoading: isLoading,
    filteredPaymentsError: error,
    filteredPaymentsValidating: isValidating,
    filteredPaymentsEmpty: !isLoading && !data?.length,
    refreshFilterPayments, // Include the refresh function separately
  };
}

export function useGetDashboardCounts() {
  const URL = endpoints.oayments.getDashboradCounts;

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
