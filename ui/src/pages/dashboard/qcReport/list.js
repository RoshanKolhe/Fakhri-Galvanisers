import { Helmet } from 'react-helmet-async';
// sections
import { QcReportListView } from 'src/sections/qcReport/view';

// ----------------------------------------------------------------------

export default function QcReportListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: QcReport List</title>
      </Helmet>

      <QcReportListView />
    </>
  );
}
