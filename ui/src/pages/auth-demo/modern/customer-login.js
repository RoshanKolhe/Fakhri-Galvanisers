import { Helmet } from 'react-helmet-async';
// sections
import { ModernCustomerLoginView } from 'src/sections/auth-demo/modern';

// ----------------------------------------------------------------------

export default function ModernCustomerLoginPage() {
  return (
    <>
      <Helmet>
        <title> Auth: Login</title>
      </Helmet>

      <ModernCustomerLoginView />
    </>
  );
}
