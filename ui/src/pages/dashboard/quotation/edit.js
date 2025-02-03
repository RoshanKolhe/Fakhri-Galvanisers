import { Helmet } from 'react-helmet-async';
// sections
import QuotationEditView from 'src/sections/quotation/view/quotation-edit-view';

// ----------------------------------------------------------------------

export default function QuotationEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Quotation Edit</title>
      </Helmet>

      <QuotationEditView />
    </>
  );
}
