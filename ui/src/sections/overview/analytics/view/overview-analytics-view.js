// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { useCustomerGetDashboardCounts } from 'src/api/customer';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsSalesOverview from '../analytics-sales-overview';
import AnalyticsCurrentBalance from '../analytics-current-balance';
import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsCurrentVisits from '../analytics-current-visits';

// ----------------------------------------------------------------------

export default function OverviewAnalyticsView() {
  const { dashboardCounts } = useCustomerGetDashboardCounts();
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Orders"
            total={dashboardCounts.totalOrdersCount}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Outstanding"
            total={dashboardCounts.totalOutstanding}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Orders In process"
            total={dashboardCounts.ordersInProcessCount}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Challans"
            total={dashboardCounts.totalChallanCount}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>
        <Grid xs={12} md={6} lg={8}>
          <AnalyticsSalesOverview
            title="Sales Overview"
            data={dashboardCounts?.ordersOverview || []}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentBalance
            title="Your Outstanding Balance"
            outStanding={dashboardCounts.totalOutstanding}
            lastOrderTotal={dashboardCounts.secondLastInvoiceAmount}
            currentOrderTotal={dashboardCounts.latestInvoiceAmount}
          />
        </Grid>
        <Grid xs={12} md={8} lg={8}>
          <AnalyticsCurrentVisits
            title="Orders"
            chart={{
              series: dashboardCounts?.ordersPercentage || [],
            }}
          />
        </Grid>
        <Grid xs={12} md={4} lg={4}>
          <AnalyticsOrderTimeline
            title="Latest Order"
            history={dashboardCounts?.latestOrder?.timeline}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
