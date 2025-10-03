// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetOrders(filterParams) {
          const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.order.list}?${queryString}` : endpoints.order.list;


  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshOrders = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    orders: data?.data || [],
    totalcount: data?.count ||{ total: 0,
      materialReceivedTotal:0,
      inProcessTotal:0,
      materialReadyTotal: 0,
      readyToDispatchTotal:0,
    } ,
    ordersLoading: isLoading,
    ordersError: error,
    ordersValidating: isValidating,
    ordersEmpty: !isLoading && (!data?.data || data?.data?.length === 0),
    refreshOrders, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetOrder(orderId) {
  const URL = orderId ? [endpoints.order.details(orderId)] : null;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);
  const refreshOrder = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    order: data,
    orderLoading: isLoading,
    orderError: error,
    orderValidating: isValidating,
    refreshOrder, // Include the refresh function separately
  };
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
    filteredOrders: data?.data || [],
    filteredOrdersLoading: isLoading,
    filteredOrdersError: error,
    filteredOrdersValidating: isValidating,
    filteredOrdersEmpty: !isLoading && !data?.data.length,
    refreshFilterOrders, // Include the refresh function separately
  };
}
