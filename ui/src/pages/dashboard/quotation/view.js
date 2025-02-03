import { Helmet } from 'react-helmet-async';
// sections
import QuotationView from 'src/sections/quotation/view/quotation-view';

// ----------------------------------------------------------------------

export default function QuotationViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Quotation View</title>
      </Helmet>

      <QuotationView />
    </>
  );
}
