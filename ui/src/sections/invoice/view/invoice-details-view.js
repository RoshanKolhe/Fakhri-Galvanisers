// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetPayment } from 'src/api/invoice';
import { useEffect, useState } from 'react';
import InvoiceDetails from '../invoice-details';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { payment, refreshPayment } = useGetPayment(id);
  const [currentInvoice, setCurrentInvoice] = useState();
  useEffect(() => {
    if (payment) {
      setCurrentInvoice(payment);
    }
  }, [payment]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentInvoice?.performaId}
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Invoice',
            href: paths.dashboard.invoice.root,
          },
          { name: currentInvoice?.performaId },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceDetails invoice={currentInvoice} refreshPayment={refreshPayment} />
    </Container>
  );
}
