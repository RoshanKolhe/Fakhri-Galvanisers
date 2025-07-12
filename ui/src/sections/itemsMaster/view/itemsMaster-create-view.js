// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ItemsMasterNewEditForm from '../itemsMaster-new-edit-form';

// ----------------------------------------------------------------------

export default function ItemsMasterCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Item"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Items Master',
            href: paths.dashboard.itemsMaster.list,
          },
          { name: 'New Item' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ItemsMasterNewEditForm />
    </Container>
  );
}
