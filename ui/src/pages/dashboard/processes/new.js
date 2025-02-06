import { Helmet } from 'react-helmet-async';
// sections
import { ProcessesCreateView } from 'src/sections/processes/view';

// ----------------------------------------------------------------------

export default function ProcessesCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new processes</title>
      </Helmet>

      <ProcessesCreateView />
    </>
  );
}
