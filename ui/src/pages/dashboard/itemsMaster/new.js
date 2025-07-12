import { Helmet } from 'react-helmet-async';
// sections
import { ItemsMasterCreateView } from 'src/sections/itemsMaster/view';

// ----------------------------------------------------------------------

export default function ItemsMasterCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Item</title>
      </Helmet>

      <ItemsMasterCreateView />
    </>
  );
}
