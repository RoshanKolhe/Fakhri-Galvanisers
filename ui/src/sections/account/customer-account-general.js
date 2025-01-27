import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// hooks
// utils
import { fData } from 'src/utils/format-number';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function CustomerAccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const [customer, setCustomer] = useState();

  const UpdateCustomerSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      email: customer?.email || '',
      dob: customer?.dob || '',
      fullAddress: customer?.fullAddress || '',
      avatarUrl: customer?.avatar?.fileUrl || null,
      phoneNumber: customer?.phoneNumber || '',
    }),
    [customer]
  );

  const methods = useForm({
    resolver: yupResolver(UpdateCustomerSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dob: formData.dob,
        fullAddress: formData.fullAddress,
      };
      if (formData.avatarUrl) {
        inputData.avatar = {
          fileUrl: formData.avatarUrl,
        };
      }
      await axiosInstance.patch(`/api/customers/${customer.id}`, inputData);
      enqueueSnackbar(customer ? 'Update success!' : 'Create success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      console.log(file);
      // const newFile = Object.assign(file, {
      //   preview: URL.createObjectURL(file),
      // });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        console.log(data);
        setValue('avatarUrl', data?.files[0].fileUrl, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  const getCurrentCustomer = async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.customer.me);

      const userData = response.data;
      setCustomer(userData);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    if (customer) {
      console.log(defaultValues);
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, reset]);

  useEffect(() => {
    getCurrentCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="avatarUrl"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
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
              <RHFTextField name="fullAddress" label="Full Address" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                style={{
                  backgroundColor: '#00554E',
                  width: '250px',
                  height: '40px',
                  marginTop: '20px',
                }}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
