// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCustomers() {
  const URL = endpoints.customer.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshCustomers = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    customers: data || [],
    customersLoading: isLoading,
    customersError: error,
    customersValidating: isValidating,
    customersEmpty: !isLoading && !data?.length,
    refreshCustomers, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetCustomer(customerId) {
  const URL = customerId ? [endpoints.customer.details(customerId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      customer: data,
      customerLoading: isLoading,
      customerError: error,
      customerValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCustomersWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.customer.filterList(filter);
  } else {
    URL = endpoints.customer.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterCustomers = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredCustomers: data || [],
    filteredCustomersLoading: isLoading,
    filteredCustomersError: error,
    filteredCustomersValidating: isValidating,
    filteredCustomersEmpty: !isLoading && !data?.length,
    refreshFilterCustomers, // Include the refresh function separately
  };
}

