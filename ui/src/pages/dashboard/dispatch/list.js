import { Helmet } from 'react-helmet-async';
// sections
import { DispatchListView } from 'src/sections/dispatch/view';

// ----------------------------------------------------------------------

export default function DispatchListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dispatch List</title>
      </Helmet>

      <DispatchListView />
    </>
  );
}
