import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { states, USER_STATUS_OPTIONS } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function QuotationQuickEditForm({
  currentQuotation,
  open,
  onClose,
  refreshQuotations,
}) {
  console.log(currentQuotation);
  const { enqueueSnackbar } = useSnackbar();

  const NewQuotationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    dob: Yup.string(),
    address: Yup.string(),
    state: Yup.string(),
    city: Yup.string(),
    zipCode: Yup.string(),
    avatarUrl: Yup.mixed().nullable(),
    isActive: Yup.boolean(),
    gstNo: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentQuotation?.firstName || '',
      lastName: currentQuotation?.lastName || '',
      dob: currentQuotation?.dob || '',
      email: currentQuotation?.email || '',
      isActive: currentQuotation?.isActive ? '1' : '0' || '',
      gstNo: currentQuotation?.gstNo || '',
      phoneNumber: currentQuotation?.phoneNumber || '',
      address: currentQuotation?.fullAddress || '',
      city: currentQuotation?.city || '',
      state: currentQuotation?.state || '',
      password: '',
      confirmPassword: '',
    }),
    [currentQuotation]
  );

  const methods = useForm({
    resolver: yupResolver(NewQuotationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive ? 1 : 0,
        dob: formData.dob,
        fullAddress: formData.address,
        city: formData.city,
        state: formData.state,
        gstNo: formData.gstNo,
      };
      await axiosInstance.patch(`/api/quotations/${currentQuotation.id}`, inputData);
      refreshQuotations();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', formData);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          {!currentQuotation?.isActive && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Account is In-Active
            </Alert>
          )}

          <Box
            mt={2}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="isActive" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="firstName" label="First Name" />
            <RHFTextField name="lastName" label="Last Name" />
            <RHFTextField name="email" label="Email Address" />
            <RHFTextField type="number" name="phoneNumber" label="Phone Number" />
            <RHFTextField name="gstNo" label="Gst No" />

            <Controller
              name="dob"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="DOB"
                  value={new Date(field.value)}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
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

            <RHFSelect fullWidth name="state" label="State">
              {states.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="city" label="City" />
            <RHFTextField name="address" label="Address" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

QuotationQuickEditForm.propTypes = {
  currentQuotation: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshQuotations: PropTypes.func,
};
