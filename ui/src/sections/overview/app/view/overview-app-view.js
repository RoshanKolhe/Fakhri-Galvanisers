// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// _mock
import { _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { useGetDashboardCounts } from 'src/api/user';
import { useGetPaymentsWithFilter } from 'src/api/invoice';
import AppWidget from '../app-widget';
import AppNewInvoice from '../app-new-invoice';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { dashboardCounts } = useGetDashboardCounts();
  const {
    filteredPayments,
    filteredPaymentsLoading,
    filteredPaymentsEmpty,
    refreshFilterPayments,
  } = useGetPaymentsWithFilter(
    `filter=${encodeURIComponent(JSON.stringify({ order: ['id DESC'], limit: 10 }))}`
  );

  const theme = useTheme();

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total Active Orders"
            percent={Number(dashboardCounts?.percentageChangeActiveOrders || '0')}
            total={dashboardCounts?.totalActiveOrders || 0}
            chart={{
              series: dashboardCounts?.last10DaysActiveOrdersCounts || [],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Orders Ready to dispatch"
            percent={Number(dashboardCounts?.percentageChangeDispatch || '0')}
            total={dashboardCounts?.totalOrdersReadyToDispatch || 0}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: dashboardCounts?.last10DaysDispatchCounts || [],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Pending RFQ"
            percent={Number(dashboardCounts?.percentageChangeRfq || '0')}
            total={dashboardCounts?.totalPendingRfq || 0}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: dashboardCounts?.last10DaysRfqCounts || [],
            }}
          />
        </Grid>
        <Grid xs={12} md={12} lg={12}>
          <Stack spacing={3}>
            <AppWidget
              title="Conversion"
              total={dashboardCounts?.totalConversions || 0}
              icon="solar:user-rounded-bold"
            />

            <AppWidget
              title="Total Challan"
              total={dashboardCounts?.totalChallan || 0}
              icon="fluent:mail-24-filled"
              color="info"
            />
          </Stack>
        </Grid>
        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="Performa Invoices"
            tableData={filteredPayments}
            tableLabels={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'totalAmount', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Performa Invoice Counts"
            chart={{
              series: dashboardCounts?.invoiceCounts || [],
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
