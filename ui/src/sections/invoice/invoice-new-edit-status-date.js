import { useFormContext, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import InvoicePaymentProofModal from './invoice-payment-proof-modal';

// ----------------------------------------------------------------------

export default function InvoiceNewEditStatusDate({ invoice, onModalClose }) {
  const { control, watch } = useFormContext();
  const [open, setOpen] = useState(false);

  const hasOpened = useRef(false);
  const status = watch('status');
  const values = watch();


  const handleClose = () => {
    setOpen(false);
    if (onModalClose) onModalClose();
  };


  const handleOpen = () => setOpen(true);


  useEffect(() => {
    if (!invoice) return;

    if (Number(invoice?.status) === 1) return;


    if (Number(status) === 1 && !hasOpened.current) {
      hasOpened.current = true;
      handleOpen();
    }
  }, [status, invoice]);

  const isPaid = Number(status) === 1 || Number(invoice?.status) === 1;




  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <RHFTextField disabled name="performaId" label="Performa Id" value={values.performaId} />

      <RHFSelect
        fullWidth
        name="status"
        label="Status"
        InputLabelProps={{ shrink: true }}
        PaperPropsSx={{ textTransform: 'capitalize' }}
        disabled={isPaid}
      >
        {[1, 0, 2, 3, 4].map((option) => (
          <MenuItem key={option} value={option}>
            {(option === 0 && 'Pending') ||
              (option === 1 && 'Paid') ||
              (option === 2 && 'Overdue') ||
              (option === 3 && 'Pending Approval') ||
              (option === 4 && 'Request Reupload')}
          </MenuItem>
        ))}
      </RHFSelect>

      <InvoicePaymentProofModal
        open={open}
        handleClose={handleClose}
        invoice={invoice}
        refreshPayment={handleClose}
      />

      <Controller
        name="createdAt"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label="Date create"
            value={new Date(field.value)}
            onChange={(newValue) => field.onChange(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
              },
            }}
            disabled
          />
        )}
      />

      <Controller
        name="dueDate"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label="Due date"
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            minDate={new Date()}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
              },
            }}
          />
        )}
      />
    </Stack>
  );
}

InvoiceNewEditStatusDate.propTypes = {
  invoice: PropTypes.object,
  onModalClose: PropTypes.func,
};
