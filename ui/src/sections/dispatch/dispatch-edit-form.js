/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-plusplus */
import { useCallback, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Grid, Stack, MenuItem, Button, Card, Box } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFSelect, RHFTextField, RHFUpload, RHFUploadBox } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import axiosInstance from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { formatDispatchId } from 'src/utils/constants';
import { DatePicker } from '@mui/x-date-pickers';
import { MultiFilePreview } from 'src/components/upload';

export default function DispatchEditForm({ currentDispatch }) {
  console.log(currentDispatch);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  const NewDispatchSchema = Yup.object().shape({
    id: Yup.string().required('Id is required'),
    customerName: Yup.string().required('Customer Name is required'),
    dispatchDate: Yup.string().required('Dispatch Date is required'),
    vehicleNumber: Yup.string().required('Vehicle Number is required'),
    documents: Yup.array().min(1, 'Documents are required'),
  });

  const defaultValues = useMemo(
    () => ({
      id: formatDispatchId(currentDispatch?.id || 0),
      customerName: currentDispatch?.customer
        ? `${currentDispatch?.customer?.firstName} ${currentDispatch?.customer?.lastName ? currentDispatch?.customer?.lastName : ''
        }`
        : '',
      dispatchDate: currentDispatch?.dispatchDate ? new Date(currentDispatch?.dispatchDate) : '',
      vehicleNumber: currentDispatch?.vehicleDetails
        ? currentDispatch?.vehicleDetails?.vehicleNumber
        : '',
      documents: currentDispatch?.documents ? currentDispatch?.documents : [],
    }),
    [currentDispatch]
  );

  const methods = useForm({
    resolver: yupResolver(NewDispatchSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const handleUpdateDispatch = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        documents: data.documents,
        dispatchDate: new Date(data.dispatchDate).toISOString(),
        vehicleDetails: {
          vehicleNumber: data.vehicleNumber,
        },
        status: 1,
      };
      await axiosInstance.patch(`/dispatches/${currentDispatch.id}`, inputData);
      reset();
      enqueueSnackbar('Update Success!');
      router.push(paths.dashboard.dispatch.root);
    } catch (err) {
      console.error(err);
      enqueueSnackbar(typeof error === 'string' ? err : err.error.message, {
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      console.log(acceptedFiles);
      if (!acceptedFiles.length) return;
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files[]', file); // Ensure backend supports array uploads
      });
      try {
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        console.log(data);
        const newFiles = data.files.map((res) => res);
        const currentImages = getValues('documents') || [];
        setValue('documents', [...currentImages, ...newFiles], {
          shouldValidate: true,
        });
      } catch (err) {
        console.error('Error uploading files:', err);
      }
    },
    [getValues, setValue]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.documents && values.documents?.filter((file) => file !== inputFile);
      setValue('documents', filtered);
    },
    [setValue, values.documents]
  );

  useEffect(() => {
    if (currentDispatch) {
      reset(defaultValues);
    }
  }, [currentDispatch, defaultValues, reset]);

  return (
    <FormProvider methods={methods} onSubmit={handleUpdateDispatch}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
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
              <RHFTextField name="id" label="Dispatch ID" disabled />
              <RHFTextField name="customerName" label="Customer Name" disabled />
              <Controller
                name="dispatchDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Dispatch Date"
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
              <RHFTextField name="vehicleNumber" label="Vehicle Number" />
            </Box>
            <Grid item xs={12} mt={3}>
              <RHFUploadBox
                multiple
                thumbnail
                name="documents"
                maxSize={3145728}
                accept={{
                  'image/*': [],
                  'video/*': [],
                  'application/pdf': [],
                  'application/msword': [],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
                  'application/vnd.ms-excel': [],
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
                  'application/zip': [],
                  'application/x-rar-compressed': [],
                  'text/plain': [],
                }}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                sx={{ mb: 3 }}
                disabled={currentDispatch?.status === 1}
              />
              {values.documents?.length > 0 && <MultiFilePreview files={values.documents} onRemove={handleRemoveFile} thumbnail/>}
            </Grid>
            {currentDispatch?.status === 0 ? (
              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentDispatch ? 'Create Dispatch' : 'Save Changes'}
                </LoadingButton>
              </Stack>
            ) : null}
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

DispatchEditForm.propTypes = {
  currentDispatch: PropTypes.arrayOf(PropTypes.object).isRequired,
};
