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
import Iconify from 'src/components/iconify';
import { Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import CustomerNewEditForm from '../customer-new-edit-form';
import CustomerAccountChangePassword from '../customer-account-change-password';

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:customer-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function CustomerEditView() {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

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
            name: `${currentCustomer?.firstName} ${currentCustomer?.lastName ? currentCustomer?.lastName : ''}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <CustomerNewEditForm currentCustomer={currentCustomer} />}

      {currentTab === 'security' && <CustomerAccountChangePassword currentCustomer={currentCustomer} />}
    </Container>
  );
}
