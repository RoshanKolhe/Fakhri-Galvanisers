import { Helmet } from 'react-helmet-async';
// sections
import { ProcessesListView } from 'src/sections/processes/view';

// ----------------------------------------------------------------------

export default function ProcessesListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Processes List</title>
      </Helmet>

      <ProcessesListView />
    </>
  );
}
