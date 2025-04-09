import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { MultiFilePreview } from 'src/components/upload';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import axiosInstance from 'src/utils/axios';
import OrderQcDetailsModal from './order-qc-details-modal';

// ----------------------------------------------------------------------

export default function OrderDetailsToolbar({
  order,
  status,
  backLink,
  createdAt,
  orderNumber,
  statusOptions,
  onChangeStatus,
}) {
  const popover = usePopover();
  const { enqueueSnackbar } = useSnackbar();

  const [showDocument, setOpenShowDocument] = useState(false);
  const [showOrderQcDetails, setOrderQcDetails] = useState(false);

  const handleOpenShowDocument = () => setOpenShowDocument(true);
  const handleCloseShowDocument = () => setOpenShowDocument(false);

  const handleOpenOrderQcDetails = () => setOrderQcDetails(true);
  const handleCloseOrderQcDetails = () => setOrderQcDetails(false);

  const getStatusLabel = (currentStatus) => {
    const foundStatus = statusOptions.find((res) => res.value === currentStatus);
    if (foundStatus) return foundStatus.label;
    return 'Unknown Status';
  };

  const onSubmitQcDetails = async (data) => {
    try {
      console.info('DATA', data);
      await axiosInstance.post(`/orders/${order.id}/order-qc-tests`, data.qcTests);
      enqueueSnackbar('Qc Tests Added Successfully');
      handleCloseOrderQcDetails();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4"> Order {orderNumber} </Typography>
              <Label
                variant="soft"
                color={
                  (status === 0 && 'success') ||
                  (status === 1 && 'warning') ||
                  (status === 2 && 'info') ||
                  (status === 3 && 'secondary') ||
                  (status === 4 && 'error') ||
                  'default'
                }
              >
                {(status === 1 && 'In Process') ||
                  (status === 2 && 'Material Ready') ||
                  (status === 3 && 'Ready To dispatch') ||
                  (status === 4 && 'Cancelled') ||
                  (status === 0 && 'Material Received')}
              </Label>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {fDateTime(createdAt)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:file-text-outline" />}
            onClick={() => {
              handleOpenOrderQcDetails();
            }}
            sx={{ textTransform: 'capitalize' }}
          >
            Qc Details
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:eye-fill" />}
            onClick={() => {
              handleOpenShowDocument();
            }}
            sx={{ textTransform: 'capitalize' }}
          >
            View Doc
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={popover.onOpen}
            sx={{ textTransform: 'capitalize' }}
            disabled
          >
            {getStatusLabel(status)}
          </Button>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === status}
            onClick={() => {
              popover.onClose();
              onChangeStatus(option.value);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>

      <Dialog open={showDocument} onClose={handleCloseShowDocument} fullWidth maxWidth="sm">
        <Box sx={{ px: 3, pt: 2 }}>
          <DialogTitle sx={{ p: 0 }}>{`${order?.orderId}`}</DialogTitle>
        </Box>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Challan Images
            </Typography>
            <MultiFilePreview files={order?.challanImages?.map((res) => res.fileUrl)} thumbnail />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Material Images
            </Typography>
            <MultiFilePreview files={order?.materialImages?.map((res) => res.fileUrl)} thumbnail />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Vehicle Images
            </Typography>
            <MultiFilePreview files={order?.vehicleImages?.map((res) => res.fileUrl)} thumbnail />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Weight Slip Images
            </Typography>
            <MultiFilePreview files={order?.poImages?.map((res) => res.fileUrl)} thumbnail />
          </Box>
        </DialogContent>
      </Dialog>

      <OrderQcDetailsModal
        currentQcReport={order?.orderQcTests || []}
        open={showOrderQcDetails}
        onClose={handleCloseOrderQcDetails}
        onSubmitForm={onSubmitQcDetails}
      />
    </>
  );
}

OrderDetailsToolbar.propTypes = {
  order: PropTypes.object,
  backLink: PropTypes.string,
  createdAt: PropTypes.string,
  onChangeStatus: PropTypes.func,
  orderNumber: PropTypes.string,
  status: PropTypes.number,
  statusOptions: PropTypes.array,
};
