import { Helmet } from 'react-helmet-async';
// sections
import { OrderNewDetailsView } from 'src/sections/order/view';

// ----------------------------------------------------------------------

export default function OrderCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Order Create</title>
      </Helmet>

      <OrderNewDetailsView />
    </>
  );
}
