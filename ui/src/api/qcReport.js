// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetQcReports() {
  const URL = endpoints.qcReport.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshQcReports = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    qcReports: data || [],
    qcReportsLoading: isLoading,
    qcReportsError: error,
    qcReportsValidating: isValidating,
    qcReportsEmpty: !isLoading && !data?.length,
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
    filteredQcReports: data || [],
    filteredQcReportsLoading: isLoading,
    filteredQcReportsError: error,
    filteredQcReportsValidating: isValidating,
    filteredQcReportsEmpty: !isLoading && !data?.length,
    refreshFilterQcReports, // Include the refresh function separately
  };
}

