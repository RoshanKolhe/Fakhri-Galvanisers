import { Helmet } from 'react-helmet-async';
// sections
import { ModernLoginView } from 'src/sections/auth-demo/modern';

// ----------------------------------------------------------------------

export default function ModernLoginPage() {
  return (
    <>
      <Helmet>
        <title> Auth: Login</title>
      </Helmet>

      <ModernLoginView />
    </>
  );
}
