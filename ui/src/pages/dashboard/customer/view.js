import { Helmet } from 'react-helmet-async';
// sections
import CustomerView from 'src/sections/customer/view/customer-view';

// ----------------------------------------------------------------------

export default function CustomerViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Customer View</title>
      </Helmet>

      <CustomerView />
    </>
  );
}
