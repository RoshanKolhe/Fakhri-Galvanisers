import { Helmet } from 'react-helmet-async';
// sections
import { ItemsMasterListView } from 'src/sections/itemsMaster/view';

// ----------------------------------------------------------------------

export default function ItemsMasterListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Items Master List</title>
      </Helmet>

      <ItemsMasterListView />
    </>
  );
}
