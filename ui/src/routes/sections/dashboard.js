import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/analytics'));
// USER
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const CustomerAccountPage = lazy(() => import('src/pages/dashboard/customer/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
const UserViewPage = lazy(() => import('src/pages/dashboard/user/view'));

// CUSTOMER
const CustomerListPage = lazy(() => import('src/pages/dashboard/customer/list'));
const CustomerCreatePage = lazy(() => import('src/pages/dashboard/customer/new'));
const CustomerEditPage = lazy(() => import('src/pages/dashboard/customer/edit'));
const CustomerViewPage = lazy(() => import('src/pages/dashboard/customer/view'));

// INQUIRY
const InquiryListPage = lazy(() => import('src/pages/dashboard/inquiry/list'));

// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <IndexPage />, index: true },
      { path: 'profile', element: <UserAccountPage /> },
      { path: 'customer-profile', element: <CustomerAccountPage /> },
      {
        path: 'user',
        children: [
          { element: <UserListPage />, index: true },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: ':id/view', element: <UserViewPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'customer',
        children: [
          { element: <CustomerListPage />, index: true },
          { path: 'list', element: <CustomerListPage /> },
          { path: 'new', element: <CustomerCreatePage /> },
          { path: ':id/edit', element: <CustomerEditPage /> },
          { path: ':id/view', element: <CustomerViewPage /> },
        ],
      },
      {
        path: 'inquiry',
        children: [
          { element: <InquiryListPage />, index: true },
          { path: 'list', element: <InquiryListPage /> },
        ],
      },

      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
