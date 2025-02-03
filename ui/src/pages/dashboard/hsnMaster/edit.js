import { Helmet } from 'react-helmet-async';
// sections
import HsnMasterEditView from 'src/sections/hsnMaster/view/hsnMaster-edit-view';

// ----------------------------------------------------------------------

export default function HsnMasterEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: HsnMaster Edit</title>
      </Helmet>

      <HsnMasterEditView />
    </>
  );
}
