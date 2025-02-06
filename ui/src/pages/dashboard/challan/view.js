import { Helmet } from 'react-helmet-async';
// sections
import ChallanView from 'src/sections/challan/view/challan-view';

// ----------------------------------------------------------------------

export default function ChallanViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Challan View</title>
      </Helmet>

      <ChallanView />
    </>
  );
}
