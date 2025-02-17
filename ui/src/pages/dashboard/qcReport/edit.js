import { Helmet } from 'react-helmet-async';
// sections
import QcReportTestEditView from 'src/sections/qcReport/view/qcReport-edit-view';

// ----------------------------------------------------------------------

export default function QcReportEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: QcReport Details</title>
      </Helmet>

      <QcReportTestEditView />
    </>
  );
}
