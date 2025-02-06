// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ProcessesNewEditForm from '../processes-new-edit-form';

// ----------------------------------------------------------------------

export default function ProcessesCreateView() {
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
            name: 'Processes',
            href: paths.dashboard.processes.list,
          },
          { name: 'New Processes' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProcessesNewEditForm />
    </Container>
  );
}
