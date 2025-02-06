// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetProcesses } from 'src/api/processes';
import ProcessesNewEditForm from '../processes-new-edit-form';

// ----------------------------------------------------------------------

export default function ProcessesEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { processes: currentProcesses } = useGetProcesses(id);

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
            name: 'Processes',
            href: paths.dashboard.processes.root,
          },
          {
            name: `${currentProcesses?.name}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProcessesNewEditForm currentProcesses={currentProcesses} />
    </Container>
  );
}
