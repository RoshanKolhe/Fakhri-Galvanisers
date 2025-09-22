import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import { PERMISSION_KEY } from 'src/utils/constants';
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

const loginPaths = {
  super_admin: paths.auth.jwt.login,
  admin: paths.auth.jwt.login,
  customer: paths.auth.jwt.customerLogin,
};

// ----------------------------------------------------------------------

export default function AuthGuard({ children }) {
  const router = useRouter();

  const { authenticated } = useAuthContext();

  const loggedInUser = localStorage.getItem(PERMISSION_KEY);

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

      const loginPath = loginPaths[loggedInUser];
      let href;
      if (loginPath) {
        href = `${loginPath}?${searchParams}`;
      } else {
        href = `${loginPaths.customer}?${searchParams}`;
      }

      console.log(href);
      router.replace(href);
    } else {
      setChecked(true);
    }
  }, [authenticated, loggedInUser, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
