import { Helmet } from 'react-helmet-async';
// sections
import { ItemsMasterEditView } from 'src/sections/itemsMaster/view';

// ----------------------------------------------------------------------

export default function ItemsMasterEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Items master Edit</title>
      </Helmet>

      <ItemsMasterEditView />
    </>
  );
}
