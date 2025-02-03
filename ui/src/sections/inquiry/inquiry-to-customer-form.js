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
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton, InputAdornment } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function InquiryToCustomerForm({ currentInquiry, open, onClose, refreshInquiry }) {
  console.log(currentInquiry);
  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const NewCustomerSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    company: Yup.string().required('Company is required'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
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
      firstName: currentInquiry?.firstName || '',
      lastName: currentInquiry?.lastName || '',
      dob: currentInquiry?.dob || '',
      email: currentInquiry?.email || '',
      company: currentInquiry?.company || '',
      gstNo: currentInquiry?.gstIn || '',
      phoneNumber: currentInquiry?.phoneNumber || '',
      address: currentInquiry?.address || '',
      city: currentInquiry?.city || '',
      state: currentInquiry?.state || '',
      password: '',
      confirmPassword: '',
    }),
    [currentInquiry]
  );

  const methods = useForm({
    resolver: yupResolver(NewCustomerSchema),
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
        isActive: 1,
        dob: formData.dob,
        fullAddress: formData.address,
        company: formData.company,
        city: formData.city,
        state: formData.state,
        gstNo: formData.gstNo,
      };
      if (formData.password) {
        inputData.password = formData.password;
      }
      await axiosInstance.post(`/inquiryToCustomer/${currentInquiry.id}`, inputData);

      refreshInquiry();
      reset();
      onClose();
      enqueueSnackbar('Customer Created Successfully!');
      console.info('DATA', formData);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
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
        <DialogTitle>Inquiry To Customer</DialogTitle>

        <DialogContent>
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
            <RHFTextField name="firstName" label="First Name" />
            <RHFTextField name="lastName" label="Last Name" />
            <RHFTextField name="email" label="Email Address" />
            <RHFTextField type="number" name="phoneNumber" label="Phone Number" />
            <RHFTextField
              name="password"
              label="Password"
              type={password.value ? 'text' : 'password'}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={password.onToggle} edge="end">
                      <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField
              name="confirmPassword"
              label="Confirm New Password"
              type={password.value ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={password.onToggle} edge="end">
                      <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <RHFTextField name="company" label="Company" />
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
            Create
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

InquiryToCustomerForm.propTypes = {
  currentInquiry: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshInquiry: PropTypes.func,
};
