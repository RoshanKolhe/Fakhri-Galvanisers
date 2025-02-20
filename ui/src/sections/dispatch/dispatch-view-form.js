/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-plusplus */
import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Grid, Stack, Card, Box } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField, RHFUpload } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { formatDispatchId } from 'src/utils/constants';

export default function DispatchViewForm({ currentDispatch }) {
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
        ? `${currentDispatch?.customer?.firstName} ${
            currentDispatch?.customer?.lastName ? currentDispatch?.customer?.lastName : ''
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
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currentDispatch) {
      reset(defaultValues);
    }
  }, [currentDispatch, defaultValues, reset]);

  return (
    <FormProvider methods={methods}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
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
                    disabled
                  />
                )}
              />
              <RHFTextField name="vehicleNumber" label="Vehicle Number" disabled />
            </Box>
            <Grid item xs={12} mt={3}>
              <RHFUpload
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
                // onDrop={handleDrop}
                // onRemove={handleRemoveFile}
                sx={{ mb: 3 }}
                disabled
              />
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

DispatchViewForm.propTypes = {
  currentDispatch: PropTypes.arrayOf(PropTypes.object).isRequired,
};
