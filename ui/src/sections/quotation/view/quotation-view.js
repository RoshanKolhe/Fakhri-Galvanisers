// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetQuotation } from 'src/api/quotation';

import { formatRFQId } from 'src/utils/constants';
import QuotationViewForm from '../quotation-view-form';

// ----------------------------------------------------------------------

export default function QuotationView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { quotation: currentQuotation } = useGetQuotation(id);

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
            name: 'Quotation',
            href: paths.dashboard.quotation.root,
          },
          {
            name: formatRFQId(id),
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <QuotationViewForm currentQuotation={currentQuotation} />
    </Container>
  );
}
