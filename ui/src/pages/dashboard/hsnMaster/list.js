import { Helmet } from 'react-helmet-async';
// sections
import { HsnMasterListView } from 'src/sections/hsnMaster/view';

// ----------------------------------------------------------------------

export default function HsnMasterListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: HsnMaster List</title>
      </Helmet>

      <HsnMasterListView />
    </>
  );
}
