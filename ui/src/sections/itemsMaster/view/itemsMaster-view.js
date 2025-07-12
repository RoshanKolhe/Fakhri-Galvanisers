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

import ItemsMasterViewForm from '../itemsMaster-view-form';

// ----------------------------------------------------------------------

export default function ItemsMasterView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { itemsMaster: currentItem } = useGetItemsMaster(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Items',
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

      <ItemsMasterViewForm currentItem={currentItem} />
    </Container>
  );
}
