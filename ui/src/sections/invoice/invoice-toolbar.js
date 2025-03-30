/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
//
import { useAuthContext } from 'src/auth/hooks';
import { DialogContent, DialogTitle, Typography } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { MultiFilePreview } from 'src/components/upload';
import axiosInstance from 'src/utils/axios';
import { LoadingButton } from '@mui/lab';
import InvoicePDF from './invoice-pdf';
import InvoicePaymentProofModal from './invoice-payment-proof-modal';

// ----------------------------------------------------------------------

export default function InvoiceToolbar({
  invoice,
  currentStatus,
  statusOptions,
  onChangeStatus,
  refreshPayment,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [openApproval, setOpenApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenApproval = () => setOpenApproval(true);
  const handleCloseApproval = () => setOpenApproval(false);

  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;
  const router = useRouter();

  const view = useBoolean();

  const handleEdit = useCallback(() => {
    if (invoice) {
      router.push(paths.dashboard.invoice.edit(invoice?.id));
    }
  }, [invoice, router]);

  const handleRequestReupload = async () => {
    try {
      const inputData = {
        status: 4,
      };
      await axiosInstance.patch(`/payments/${invoice?.id}`, inputData);
      refreshPayment();
      enqueueSnackbar('Re-upload requested successfully');
      handleCloseApproval();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
      handleCloseApproval();
    }
  };

  const handleApprovePayment = async () => {
    try {
      const inputData = {
        status: 1,
      };
      await axiosInstance.patch(`/payments/${invoice?.id}`, inputData);
      enqueueSnackbar('Payment Proof Approved Successfully');
      refreshPayment();
      handleCloseApproval();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
      handleCloseApproval();
    }
  };

  const handleForceDispatch = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post(`/orders/${invoice?.order?.id}/dispatch`);
      enqueueSnackbar('Dispatch Created Successfully');
      refreshPayment();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          {isAdmin ? (
            <Tooltip title="Edit">
              <IconButton onClick={handleEdit}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title="View">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} currentStatus={currentStatus} />}
            fileName={invoice?.performaId}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Tooltip title="Download">
                <IconButton>
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Iconify icon="eva:cloud-download-fill" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </PDFDownloadLink>
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          {/* Button for non-admin users to Upload/View Payment Proof */}
          {!isAdmin || (isAdmin && invoice?.status === 1) ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={handleOpen}
            >
              {invoice?.status === 1 ? 'View' : 'Upload'} Payment Proof
            </Button>
          ) : null}

          {isAdmin && invoice?.status === 3 && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={handleOpenApproval}
            >
              Verify Payment
            </Button>
          )}

          {isAdmin && !invoice?.isPaidSkip && invoice?.status !== 1 && (
            <LoadingButton
              variant="contained"
              startIcon={<Iconify icon="mdi:fast-forward" />}
              onClick={handleForceDispatch}
              loading={isLoading} // Set loading state
            >
              Dispatch Unpaid
            </LoadingButton>
          )}

          <TextField
            fullWidth
            select
            label="Status"
            value={currentStatus}
            onChange={onChangeStatus}
            sx={{
              maxWidth: 190,
            }}
            disabled
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Dialog fullScreen open={view.value}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions
            sx={{
              p: 1.5,
            }}
          >
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              <InvoicePDF invoice={invoice} currentStatus={currentStatus} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>

      <InvoicePaymentProofModal
        open={open}
        handleClose={handleClose}
        invoice={invoice}
        refreshPayment={refreshPayment}
      />

      <Dialog open={openApproval} onClose={handleCloseApproval} fullWidth maxWidth="sm">
        <Box sx={{ px: 3, pt: 2 }}>
          <DialogTitle sx={{ p: 0 }}>{`${invoice?.performaId}`}</DialogTitle>
        </Box>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Payment Proof
            </Typography>
            <MultiFilePreview files={invoice?.paymentProof} thumbnail />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1.5 }}>
          <Button color="inherit" variant="outlined" onClick={handleRequestReupload}>
            Request Re-Upload
          </Button>
          <Button color="inherit" variant="contained" onClick={handleApprovePayment}>
            Approve Payment
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

InvoiceToolbar.propTypes = {
  currentStatus: PropTypes.number,
  invoice: PropTypes.object,
  onChangeStatus: PropTypes.func,
  statusOptions: PropTypes.array,
  refreshPayment: PropTypes.func,
};
