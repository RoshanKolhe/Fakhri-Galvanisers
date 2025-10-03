// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------


// src/api/customer.js
export function useGetCustomers(filterParams) {
        const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.customer.list}?${queryString}` : endpoints.customer.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshCustomers = useCallback(() => {
    mutate();
  }, [mutate]);

  return useMemo(
    () => ({
      customers: data?.data || [],
      totalCount: data?.count || {
        total: 0,
        activeTotal: 0,
        inActiveTotal: 0
      },
      customersLoading: isLoading,
      customersError: error,
      customersValidating: isValidating,
      customersEmpty: !isLoading && (!data?.data || data?.data?.length === 0),
      refreshCustomers,
    }),
    [data?.data, data?.count, error, isLoading, isValidating, refreshCustomers]
  );
}




// ----------------------------------------------------------------------

export function useGetCustomer(customerId) {
  const URL = customerId ? [endpoints.customer.details(customerId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      customer: data?.data ||[] ,
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
    filteredCustomers: data?.data || [],
    filteredCustomersLoading: isLoading,
    filteredCustomersError: error,
    filteredCustomersValidating: isValidating,
    filteredCustomersEmpty: !isLoading && !data?.data?.length,
    refreshFilterCustomers, // Include the refresh function separately
  };
}

export function useCustomerGetDashboardCounts() {
  const URL = endpoints.customer.getCustomerDashboradCounts;

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
