import { Helmet } from 'react-helmet-async';
// sections
import QcReportTestView from 'src/sections/qcReport/view/qcReport-view';

// ----------------------------------------------------------------------

export default function QcReportViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: QcReport Details</title>
      </Helmet>

      <QcReportTestView />
    </>
  );
}
