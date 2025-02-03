import { Helmet } from 'react-helmet-async';
// sections
import { QuotationCreateView } from 'src/sections/quotation/view';

// ----------------------------------------------------------------------

export default function QuotationCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new quotation</title>
      </Helmet>

      <QuotationCreateView />
    </>
  );
}
