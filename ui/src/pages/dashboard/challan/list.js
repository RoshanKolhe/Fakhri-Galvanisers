import { Helmet } from 'react-helmet-async';
// sections
import { ChallanListView } from 'src/sections/challan/view';

// ----------------------------------------------------------------------

export default function ChallanListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Challan List</title>
      </Helmet>

      <ChallanListView />
    </>
  );
}
