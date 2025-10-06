// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetHsnMasters(filterParams) {
    const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.hsnMaster.list}?${queryString}` : endpoints.hsnMaster.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshHsnMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    hsnMasters: data?.data || [],
    totalCount: data?.count || {total: 0,
       activeTotal: 0,
        inActiveTotal: 0},
    hsnMastersLoading: isLoading,
    hsnMastersError: error,
    hsnMastersValidating: isValidating,
    hsnMastersEmpty: !isLoading && (!data?.data ||!data?.data?.length === 0),
    refreshHsnMasters, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetHsnMaster(hsnMasterId) {
  const URL = hsnMasterId ? [endpoints.hsnMaster.details(hsnMasterId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      hsnMaster: data,
      hsnMasterLoading: isLoading,
      hsnMasterError: error,
      hsnMasterValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetHsnMastersWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.hsnMaster.filterList(filter);
  } else {
    URL = endpoints.hsnMaster.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterHsnMasters = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredHsnMasters: data?.data || [],
    filteredHsnMastersLoading: isLoading,
    filteredHsnMastersError: error,
    filteredHsnMastersValidating: isValidating,
    filteredHsnMastersEmpty: !isLoading && !data?.data?.length,
    refreshFilterHsnMasters, // Include the refresh function separately
  };
}

