import { Helmet } from 'react-helmet-async';
// sections
import { HsnMasterCreateView } from 'src/sections/hsnMaster/view';

// ----------------------------------------------------------------------

export default function HsnMasterCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new hsnMaster</title>
      </Helmet>

      <HsnMasterCreateView />
    </>
  );
}
