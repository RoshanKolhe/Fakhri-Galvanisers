import { Helmet } from 'react-helmet-async';
// sections
import HsnMasterView from 'src/sections/hsnMaster/view/hsnMaster-view';

// ----------------------------------------------------------------------

export default function HsnMasterViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: HsnMaster View</title>
      </Helmet>

      <HsnMasterView />
    </>
  );
}
