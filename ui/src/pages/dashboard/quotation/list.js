import { Helmet } from 'react-helmet-async';
// sections
import { QuotationListView } from 'src/sections/quotation/view';

// ----------------------------------------------------------------------

export default function QuotationListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Quotation List</title>
      </Helmet>

      <QuotationListView />
    </>
  );
}
