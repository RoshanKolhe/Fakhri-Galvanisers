// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetHsnMaster } from 'src/api/hsnMaster';
import HsnMasterNewEditForm from '../hsnMaster-new-edit-form';

// ----------------------------------------------------------------------

export default function HsnMasterEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { hsnMaster: currentHsnMaster } = useGetHsnMaster(id);

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
            name: 'HsnMaster',
            href: paths.dashboard.hsnMaster.root,
          },
          {
            name: `${currentHsnMaster?.hsnCode}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HsnMasterNewEditForm currentHsnMaster={currentHsnMaster} />
    </Container>
  );
}
