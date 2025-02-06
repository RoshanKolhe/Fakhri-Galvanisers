import { Helmet } from 'react-helmet-async';
// sections
import { ChallanCreateView } from 'src/sections/challan/view';

// ----------------------------------------------------------------------

export default function ChallanCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new challan</title>
      </Helmet>

      <ChallanCreateView />
    </>
  );
}
