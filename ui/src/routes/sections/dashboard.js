import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import { RolesAuthRoute } from './RolesAuthRoute';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
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

// QUOTATION
const QuotationListPage = lazy(() => import('src/pages/dashboard/quotation/list'));
const QuotationCreatePage = lazy(() => import('src/pages/dashboard/quotation/new'));
const QuotationEditPage = lazy(() => import('src/pages/dashboard/quotation/edit'));
const QuotationViewPage = lazy(() => import('src/pages/dashboard/quotation/view'));

// HSNMASTER
const HsnMasterListPage = lazy(() => import('src/pages/dashboard/hsnMaster/list'));
const HsnMasterCreatePage = lazy(() => import('src/pages/dashboard/hsnMaster/new'));
const HsnMasterEditPage = lazy(() => import('src/pages/dashboard/hsnMaster/edit'));
const HsnMasterViewPage = lazy(() => import('src/pages/dashboard/hsnMaster/view'));

// PROCESSES
const ProcessesListPage = lazy(() => import('src/pages/dashboard/processes/list'));
const ProcessesCreatePage = lazy(() => import('src/pages/dashboard/processes/new'));
const ProcessesEditPage = lazy(() => import('src/pages/dashboard/processes/edit'));
const ProcessesViewPage = lazy(() => import('src/pages/dashboard/processes/view'));

// CHALLAN
const ChallanListPage = lazy(() => import('src/pages/dashboard/challan/list'));
const ChallanCreatePage = lazy(() => import('src/pages/dashboard/challan/new'));
const ChallanEditPage = lazy(() => import('src/pages/dashboard/challan/edit'));
const ChallanViewPage = lazy(() => import('src/pages/dashboard/challan/view'));

// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));

// QCREPORT
const QcReportListPage = lazy(() => import('src/pages/dashboard/qcReport/list'));
const QcReportEditPage = lazy(() => import('src/pages/dashboard/qcReport/edit'));
const QcReportViewPage = lazy(() => import('src/pages/dashboard/qcReport/view'));

// DISPATCH
const DispatchListPage = lazy(() => import('src/pages/dashboard/dispatch/list'));
const DispatchEditPage = lazy(() => import('src/pages/dashboard/dispatch/edit'));
const DispatchViewPage = lazy(() => import('src/pages/dashboard/dispatch/view'));

// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));

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
        element: <RolesAuthRoute roles={['super_admin']} />,
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
        element: <RolesAuthRoute roles={['super_admin']} />,
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
        element: <RolesAuthRoute roles={['super_admin']} />,
        children: [
          { element: <InquiryListPage />, index: true },
          { path: 'list', element: <InquiryListPage /> },
        ],
      },

      {
        path: 'quotation',
        children: [
          { element: <QuotationListPage />, index: true },
          { path: 'list', element: <QuotationListPage /> },
          { path: 'new', element: <QuotationCreatePage /> },
          { path: ':id/edit', element: <QuotationEditPage /> },
          { path: ':id/view', element: <QuotationViewPage /> },
        ],
      },
      {
        path: 'hsnMaster',
        element: <RolesAuthRoute roles={['super_admin']} />,
        children: [
          { element: <HsnMasterListPage />, index: true },
          { path: 'list', element: <HsnMasterListPage /> },
          { path: 'new', element: <HsnMasterCreatePage /> },
          { path: ':id/edit', element: <HsnMasterEditPage /> },
          { path: ':id/view', element: <HsnMasterViewPage /> },
        ],
      },
      {
        path: 'processes',
        element: <RolesAuthRoute roles={['super_admin']} />,
        children: [
          { element: <ProcessesListPage />, index: true },
          { path: 'list', element: <ProcessesListPage /> },
          { path: 'new', element: <ProcessesCreatePage /> },
          { path: ':id/edit', element: <ProcessesEditPage /> },
          { path: ':id/view', element: <ProcessesViewPage /> },
        ],
      },
      {
        path: 'challan',
        children: [
          { element: <ChallanListPage />, index: true },
          { path: 'list', element: <ChallanListPage /> },
          { path: 'new', element: <ChallanCreatePage /> },
          { path: ':id/edit', element: <ChallanEditPage /> },
          { path: ':id/view', element: <ChallanViewPage /> },
        ],
      },

      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },

      {
        path: 'qcReport',
        children: [
          { element: <QcReportListPage />, index: true },
          { path: 'list', element: <QcReportListPage /> },
          {
            path: ':id',
            element: <RolesAuthRoute roles={['super_admin']} />,
            children: [{ path: 'edit', element: <QcReportEditPage /> }],
          },
          { path: ':id/view', element: <QcReportViewPage /> },
        ],
      },
      {
        path: 'dispatch',
        children: [
          { element: <DispatchListPage />, index: true },
          { path: 'list', element: <DispatchListPage /> },
          {
            path: ':id',
            element: <RolesAuthRoute roles={['super_admin']} />,
            children: [{ path: 'edit', element: <DispatchEditPage /> }],
          },
          { path: ':id/view', element: <DispatchViewPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          {
            path: ':id',
            element: <RolesAuthRoute roles={['super_admin']} />,
            children: [{ path: 'edit', element: <InvoiceEditPage /> }],
          },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },

      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
