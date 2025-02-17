// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetQcReport } from 'src/api/qcReport';
import { formatQcReportId } from 'src/utils/constants';
import QcReportTestsEditForm from '../qcReport-tests-edit-form';

// ----------------------------------------------------------------------

export default function QcReportTestEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { qcReport: currentQcReport } = useGetQcReport(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Qc Report',
            href: paths.dashboard.qcReport.root,
          },
          {
            name: `${formatQcReportId(id || 0)}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <QcReportTestsEditForm currentQcReport={currentQcReport} />
    </Container>
  );
}
