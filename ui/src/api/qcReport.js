// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetQcReports(filterParams) {
 const queryString = filterParams ? `filter=${encodeURIComponent(JSON.stringify(filterParams))}` : undefined;
    const URL = queryString ? `${endpoints.qcReport.list}?${queryString}` : endpoints.qcReport.list;



  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshQcReports = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    qcReports: data?.data || [],
    totalCount: data?.count || {total:0 ,
pendingTotal:0,
completedTotal:0
  },
    qcReportsLoading: isLoading,
    qcReportsError: error,
    qcReportsValidating: isValidating,

    qcReportsEmpty: !isLoading && (!data?.data || !data?.data?.length=== 0),
    refreshQcReports, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetQcReport(qcReportId) {
  const URL = qcReportId ? [endpoints.qcReport.details(qcReportId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      qcReport: data,
      qcReportLoading: isLoading,
      qcReportError: error,
      qcReportValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetQcReportsWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.qcReport.filterList(filter);
  } else {
    URL = endpoints.qcReport.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterQcReports = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredQcReports: data?.data || [],
    filteredQcReportsLoading: isLoading,
    filteredQcReportsError: error,
    filteredQcReportsValidating: isValidating,
    filteredQcReportsEmpty: !isLoading && !data?.data?.length,
    refreshFilterQcReports, // Include the refresh function separately
  };
}

