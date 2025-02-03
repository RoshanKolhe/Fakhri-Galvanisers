// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import HsnMasterNewEditForm from '../hsnMaster-new-edit-form';

// ----------------------------------------------------------------------

export default function HsnMasterCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Hsn Master"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'HsnMaster',
            href: paths.dashboard.hsnMaster.list,
          },
          { name: 'New HsnMaster' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HsnMasterNewEditForm />
    </Container>
  );
}
