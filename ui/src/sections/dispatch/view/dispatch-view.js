// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetDispatch } from 'src/api/dispatch';  
import { formatDispatchId } from 'src/utils/constants';
import DispatchViewForm from '../dispatch-view-form';

// ----------------------------------------------------------------------

export default function DispatchView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { dispatch: currentDispatch } = useGetDispatch(id);

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
            name: 'Dispatch',
            href: paths.dashboard.dispatch.root,
          },
          {
            name: `${formatDispatchId(id || 0)}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DispatchViewForm currentDispatch={currentDispatch} />
    </Container>
  );
}
