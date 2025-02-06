// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ChallanNewEditForm from '../challan-new-edit-form'

// ----------------------------------------------------------------------

export default function ChallanCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Challan"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Challan',
            href: paths.dashboard.challan.list,
          },
          { name: 'New Challan' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ChallanNewEditForm />
    </Container>
  );
}
