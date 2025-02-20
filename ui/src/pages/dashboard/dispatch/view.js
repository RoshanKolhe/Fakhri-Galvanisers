import { Helmet } from 'react-helmet-async';
// sections
import DispatchTestView from 'src/sections/dispatch/view/dispatch-view';

// ----------------------------------------------------------------------

export default function DispatchViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dispatch Details</title>
      </Helmet>

      <DispatchTestView />
    </>
  );
}
