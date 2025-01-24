import { Helmet } from 'react-helmet-async';
// sections
import { ModernCustomerNewPasswordView } from 'src/sections/auth-demo/modern';

// ----------------------------------------------------------------------

export default function ModernCustomerNewPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Auth Classic: New Password</title>
      </Helmet>

      <ModernCustomerNewPasswordView />
    </>
  );
}
