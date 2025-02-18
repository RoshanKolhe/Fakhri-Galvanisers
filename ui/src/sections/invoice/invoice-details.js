import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
//
import { INVOICE_STATUS_OPTIONS } from 'src/utils/constants';
import { useAuthContext } from 'src/auth/hooks';
import InvoiceToolbar from './invoice-toolbar';

// ----------------------------------------------------------------------

export default function InvoiceDetails({ invoice }) {
 
  const [currentStatus, setCurrentStatus] = useState();
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalTax: 0,
    grandTotal: 0,
  });

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);

  const calculateTotals = (allMaterials) => {
    let subtotal = 0;
    let totalTax = 0;
    let grandTotal = 0;

    allMaterials.forEach((material) => {
      const pricePerUnit = parseFloat(material?.pricePerUnit) || 0;
      const quantity = parseFloat(material?.quantity) || 0;
      const tax = parseFloat(material?.tax) || 0;
      if (pricePerUnit && quantity) {
        const totalPrice = pricePerUnit * quantity;
        const taxAmount = (totalPrice * tax) / 100;

        subtotal += totalPrice;
        totalTax += taxAmount;
        grandTotal += totalPrice + taxAmount;
      }
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };

  useEffect(() => {
    if (invoice) {
      setCurrentStatus(invoice.status);
      const invoiceTotals = calculateTotals(invoice?.order?.challan?.materials);
      setTotals(invoiceTotals);
    }
  }, [invoice]);

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(totals.subtotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totals.totalTax) || '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totals.grandTotal) || '-'}</Box>
      </Stack>
    </Stack>
  );

  const renderFooter = (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant="subtitle2">NOTES</Typography>

        <Typography variant="body2">
          We appreciate your business. Should you need any help please contact admin!
        </Typography>
      </Grid>

      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant="subtitle2">Have a Question?</Typography>

        <Typography variant="body2">marketing@hylite.co.in</Typography>
      </Grid>
    </Grid>
  );

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Scrollbar>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>

              <TableCell sx={{ typography: 'subtitle2' }}>Description</TableCell>

              <TableCell>Qty</TableCell>
              <TableCell>Tax</TableCell>

              <TableCell align="right">Unit price</TableCell>

              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {invoice?.order?.challan?.materials.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="subtitle2">{row?.materialType}</Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      {row?.hsnNo?.hsnCode}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{row?.quantity}</TableCell>
                <TableCell>{row?.tax}</TableCell>

                <TableCell align="right">{fCurrency(row?.pricePerUnit)}</TableCell>

                <TableCell align="right">{fCurrency(row?.priceAfterTax)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {renderTotal}
      </Scrollbar>
    </TableContainer>
  );

  return (
    <>
      <InvoiceToolbar
        invoice={invoice}
        currentStatus={currentStatus || 0}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      />

      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          rowGap={5}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <Box
            component="img"
            alt="logo"
            src="/logo/hylite_logo.png"
            sx={{ width: 60, height: 60 }}
          />

          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Label
              variant="soft"
              color={
                (currentStatus === 1 && 'success') ||
                (currentStatus === 0 && 'warning') ||
                (currentStatus === 2 && 'error') ||
                (currentStatus === 3 && 'info') || // Pending Approval
                (currentStatus === 4 && 'secondary') || // Request Reupload
                'default'
              }
            >
              {(currentStatus === 0 && 'Pending') ||
                (currentStatus === 1 && 'Paid') ||
                (currentStatus === 2 && 'Overdue') ||
                (currentStatus === 3 && 'Pending Approval') ||
                (currentStatus === 4 && 'Request Reupload')}
            </Label>

            <Typography variant="h6">{invoice?.performaId}</Typography>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Invoice From
            </Typography>
            Hylite
            <br />
            A/129, T.T.C. MIDC Indl.Area, Khairane Fire Brigade Lane Pawane, Navi Mumbai, India.
            <br />
            Phone: 7253000111
            <br />
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Invoice To
            </Typography>
            {invoice?.customer?.firstName}
            <br />
            {invoice?.customer?.fullAddress}
            <br />
            Phone: {invoice?.customer?.phoneNumber}
            <br />
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Date Create
            </Typography>
            {fDate(invoice?.createdAt)}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Due Date
            </Typography>
            {fDate(invoice?.dueDate)}
          </Stack>
        </Box>

        {renderList}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        {renderFooter}
      </Card>
    </>
  );
}

InvoiceDetails.propTypes = {
  invoice: PropTypes.object,
};
