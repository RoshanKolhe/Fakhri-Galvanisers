import { Helmet } from 'react-helmet-async';
// sections
import DispatchTestEditView from 'src/sections/dispatch/view/dispatch-edit-view';

// ----------------------------------------------------------------------

export default function DispatchEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dispatch Details</title>
      </Helmet>

      <DispatchTestEditView />
    </>
  );
}
