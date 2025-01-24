import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// layouts
import AuthModernLayout from 'src/layouts/auth/modern';
import AuthModernCompactLayout from 'src/layouts/auth/modern-compact';
// components
import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// MODERN
const LoginModernPage = lazy(() => import('src/pages/auth-demo/modern/login'));
const CustomerLoginModernPage = lazy(() => import('src/pages/auth-demo/modern/customer-login'));
const RegisterModernPage = lazy(() => import('src/pages/auth-demo/modern/register'));
const ForgotPasswordModernPage = lazy(() => import('src/pages/auth-demo/modern/forgot-password'));
const CustomerForgotPasswordModernPage = lazy(() =>
  import('src/pages/auth-demo/modern/customer-forgot-password')
);
const VerifyModernPage = lazy(() => import('src/pages/auth-demo/modern/verify'));
const NewPasswordModernPage = lazy(() => import('src/pages/auth-demo/modern/new-password'));
const CustomerNewPasswordModernPage = lazy(() =>
  import('src/pages/auth-demo/modern/customer-new-password')
);

const authModern = {
  path: 'admin',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      element: (
        <AuthModernCompactLayout>
          <Outlet />
        </AuthModernCompactLayout>
      ),
      children: [
        { path: 'login', element: <LoginModernPage /> },
        { path: 'customer-login', element: <CustomerLoginModernPage /> },
        { path: 'register', element: <RegisterModernPage /> },
        { path: 'forgot-password', element: <ForgotPasswordModernPage /> },
        { path: 'customer-forgot-password', element: <CustomerForgotPasswordModernPage /> },
        { path: 'new-password', element: <NewPasswordModernPage /> },
        { path: 'customer-new-password', element: <CustomerNewPasswordModernPage /> },
        { path: 'verify', element: <VerifyModernPage /> },
      ],
    },
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authModern],
  },
];
