import { Helmet } from 'react-helmet-async';
import ModernCustomerForgotPasswordView from 'src/sections/auth-demo/modern/modern-customer-forgot-password-view';
// sections

// ----------------------------------------------------------------------

export default function ModernCustomerForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Auth Classic: Forgot Password</title>
      </Helmet>

      <ModernCustomerForgotPasswordView />
    </>
  );
}
