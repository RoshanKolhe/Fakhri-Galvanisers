import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { TableHeadCustom } from 'src/components/table';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function AppNewInvoice({ title, subheader, tableData, tableLabels, ...other }) {
  const router = useRouter();
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 680 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData?.length > 0 && tableData.map((row) => (
                <AppNewInvoiceRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
          onClick={() => {
            router.push(paths.dashboard.invoice.root);
          }}
        >
          View All
        </Button>
      </Box>
    </Card>
  );
}

AppNewInvoice.propTypes = {
  subheader: PropTypes.string,
  tableData: PropTypes.array,
  tableLabels: PropTypes.array,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function AppNewInvoiceRow({ row }) {
  const popover = usePopover();

  return (
    <TableRow>
      <TableCell>{row.performaId}</TableCell>

      <TableCell>{row.totalAmount}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 1 && 'success') ||
            (row.status === 0 && 'warning') ||
            (row.status === 2 && 'error') ||
            (row.status === 3 && 'info') || // Pending Approval
            (row.status === 4 && 'secondary') || // Request Reupload
            'default'
          }
        >
          {(row.status === 0 && 'Pending') ||
            (row.status === 1 && 'Paid') ||
            (row.status === 2 && 'Overdue') ||
            (row.status === 3 && 'Pending Approval') ||
            (row.status === 4 && 'Request Reupload')}
        </Label>
      </TableCell>
    </TableRow>
  );
}

AppNewInvoiceRow.propTypes = {
  row: PropTypes.object,
};
