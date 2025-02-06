import { Helmet } from 'react-helmet-async';
// sections
import ProcessesView from 'src/sections/processes/view/processes-view';

// ----------------------------------------------------------------------

export default function ProcessesViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Processes View</title>
      </Helmet>

      <ProcessesView />
    </>
  );
}
