import { Helmet } from 'react-helmet-async';
// sections
import CustomerEditView from 'src/sections/customer/view/customer-edit-view';

// ----------------------------------------------------------------------

export default function CustomerEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Customer Edit</title>
      </Helmet>

      <CustomerEditView />
    </>
  );
}
