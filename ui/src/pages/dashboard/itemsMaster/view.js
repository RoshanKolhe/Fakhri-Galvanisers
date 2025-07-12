import { Helmet } from 'react-helmet-async';
// sections
import ItemsMasterView from 'src/sections/itemsMaster/view/itemsMaster-view';

// ----------------------------------------------------------------------

export default function ItemsMasterViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Items Master View</title>
      </Helmet>

      <ItemsMasterView />
    </>
  );
}
