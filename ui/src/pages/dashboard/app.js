import { Helmet } from 'react-helmet-async';
import { useAuthContext } from 'src/auth/hooks';
import { OverviewAnalyticsView } from 'src/sections/overview/analytics/view';
// sections
import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;
  return (
    <>
      <Helmet>
        <title> Dashboard: App</title>
      </Helmet>

      {isAdmin ? <OverviewAppView /> : <OverviewAnalyticsView />}
    </>
  );
}
