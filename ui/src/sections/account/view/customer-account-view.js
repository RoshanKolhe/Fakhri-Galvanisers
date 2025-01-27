import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import CustomerAccountGeneral from '../customer-account-general';
import CustomerAccountChangePassword from '../customer-account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function CustomerAccountView() {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
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

      {currentTab === 'general' && <CustomerAccountGeneral />}

      {currentTab === 'security' && <CustomerAccountChangePassword />}
    </Container>
  );
}
