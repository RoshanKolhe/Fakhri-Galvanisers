// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetCustomer } from 'src/api/customer';

import CustomerViewForm from '../customer-view-form';

// ----------------------------------------------------------------------

export default function CustomerView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { customer: currentCustomer } = useGetCustomer(id);

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
            name: 'Customer',
            href: paths.dashboard.customer.root,
          },
          {
            name: `${currentCustomer?.firstName} ${
              currentCustomer?.lastName ? currentCustomer?.lastName : ''
            }`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CustomerViewForm currentCustomer={currentCustomer} />
    </Container>
  );
}
