// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetItemsMaster } from 'src/api/itemsMaster';
import ItemsMasterNewEditForm from '../itemsMaster-new-edit-form';

// ----------------------------------------------------------------------

export default function ItemsMasterEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { itemsMaster: currentItem } = useGetItemsMaster(id);

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
            name: 'Items Master',
            href: paths.dashboard.itemsMaster.root,
          },
          {
            name: `${currentItem?.materialType}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ItemsMasterNewEditForm currentItemsMaster={currentItem} />
    </Container>
  );
}
