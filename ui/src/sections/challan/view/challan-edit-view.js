// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetChallan } from 'src/api/challan';
import { formatChallanId } from 'src/utils/constants';
import ChallanNewEditForm from '../challan-new-edit-form';

// ----------------------------------------------------------------------

export default function ChallanEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { challan: currentChallan } = useGetChallan(id);

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
            name: 'Challan',
            href: paths.dashboard.challan.root,
          },
          {
            name: formatChallanId(id),
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ChallanNewEditForm currentChallan={currentChallan} />
    </Container>
  );
}
