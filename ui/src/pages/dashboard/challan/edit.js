import { Helmet } from 'react-helmet-async';
// sections
import ChallanEditView from 'src/sections/challan/view/challan-edit-view';

// ----------------------------------------------------------------------

export default function ChallanEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Challan Edit</title>
      </Helmet>

      <ChallanEditView />
    </>
  );
}
