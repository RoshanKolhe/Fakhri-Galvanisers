// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import QuotationNewEditForm from '../quotation-new-edit-form';

// ----------------------------------------------------------------------

export default function QuotationCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new quotation"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Quotation',
            href: paths.dashboard.quotation.list,
          },
          { name: 'New quotation' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <QuotationNewEditForm />
    </Container>
  );
}
