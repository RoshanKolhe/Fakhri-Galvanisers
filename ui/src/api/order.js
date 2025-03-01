// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetOrders() {
  const URL = endpoints.order.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshOrders = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    orders: data || [],
    ordersLoading: isLoading,
    ordersError: error,
    ordersValidating: isValidating,
    ordersEmpty: !isLoading && !data?.length,
    refreshOrders, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetOrder(orderId) {
  const URL = orderId ? [endpoints.order.details(orderId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      order: data,
      orderLoading: isLoading,
      orderError: error,
      orderValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetOrdersWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.order.filterList(filter);
  } else {
    URL = endpoints.order.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterOrders = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredOrders: data || [],
    filteredOrdersLoading: isLoading,
    filteredOrdersError: error,
    filteredOrdersValidating: isValidating,
    filteredOrdersEmpty: !isLoading && !data?.length,
    refreshFilterOrders, // Include the refresh function separately
  };
}

