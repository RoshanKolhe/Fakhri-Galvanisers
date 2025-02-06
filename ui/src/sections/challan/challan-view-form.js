import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// utils
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { formatRFQId } from 'src/utils/constants';
import { Autocomplete, MenuItem, TextField, Typography } from '@mui/material';
import { useGetHsnMasters } from 'src/api/hsnMaster';

// ----------------------------------------------------------------------

export default function ChallanViewForm({ currentChallan }) {
  const router = useRouter();
  const [quotationOptions, setQuotationOptions] = useState([]);
  const { hsnMasters, hsnMastersLoading, hsnMastersEmpty, refreshQuotations } = useGetHsnMasters();

  const { enqueueSnackbar } = useSnackbar();

  const NewChallanSchema = Yup.object().shape({
    quotation: Yup.object().required('Quotation is Required'),
    vehicleNumber: Yup.string().required('Vehicle Number is required'),
    grossWeight: Yup.number()
      .min(1, 'Value must be greater than 0')
      .required('Gross Weight is required'),
    tareWeight: Yup.number()
      .min(0.01, 'Value must be greater than 0')
      .required('Tare Weight is required'),
    netWeight: Yup.number()
      .min(0.01, 'Value must be greater than 0')
      .required('Net Weight is required'),
    poNumber: Yup.string().required('PO Number is required'),
    remark: Yup.string(),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          materialType: Yup.string().required('Material type is required'),
          quantity: Yup.number().required('Quantity is  required'),
          billingUnit: Yup.string().required('Billing Unit is required'),
          hsnNo: Yup.object().required('Hsn is required'),
          microns: Yup.number().required('Microns is required'),
          tax: Yup.number().required('Tax is required'),
          pricePerUnit: Yup.number().required('Price is required'),
          priceAfterTax: Yup.number().required('Price After Tax is required'),
        })
      )
      .min(1, 'At least one material is required'),
    status: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      quotation: currentChallan?.quotation || null,
      vehicleNumber: currentChallan?.vehicleNumber || '',
      grossWeight: currentChallan?.grossWeight || 0,
      tareWeight: currentChallan?.tareWeight || 0,
      netWeight: currentChallan?.netWeight || 0,
      poNumber: currentChallan?.poNumber || '',
      materials: currentChallan?.materials?.length
        ? currentChallan.materials.map((material) => ({
            materialType: material.materialType || '',
            quantity: material.quantity || null,
            billingUnit: material.billingUnit || '',
            hsnNo: material.hsnNo || null,
            microns: material.microns || 0,
            tax: material.tax || 0,
            pricePerUnit: material.pricePerUnit || 0,
            priceAfterTax: material.priceAfterTax || 0,
          }))
        : [],
      status: currentChallan?.status || 1,
      remark: currentChallan?.remark || '',
    }),
    [currentChallan]
  );

  const methods = useForm({
    resolver: yupResolver(NewChallanSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });
  const quotationDetails = watch('quotation');
  const values = watch();

  console.log(quotationOptions);
  const fetchQuotations = async (event) => {
    console.log(event?.target?.value);
    try {
      if (event && event.target.value) {
        const filter = {
          where: {
            id: { like: event.target.value },
          },
        };
        const filterString = encodeURIComponent(JSON.stringify(filter));
        const { data } = await axiosInstance.get(`/quotations?filter=${filterString}`);
        setQuotationOptions(data);
        console.log(data);
      } else {
        setQuotationOptions([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);
      const inputData = {
        grossWeight: formData.grossWeight,
        netWeight: formData.netWeight,
        poNumber: formData.poNumber,
        remark: formData.remark,
        tareWeight: formData.tareWeight,
        vehicleNumber: formData.vehicleNumber,
        quotationId: formData.quotation.id,
        status: formData.status ? 1 : 0,
        materials: formData.materials,
      };
      if (!currentChallan) {
        await axiosInstance.post('/challans', inputData);
      } else {
        await axiosInstance.patch(`/challans/${currentChallan.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentChallan ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.challan.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const renderMaterialDetailsForm = (
    <Stack spacing={3} mt={2}>
      {fields.map((item, index) => (
        <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFTextField
              name={`materials[${index}].materialType`}
              label="Material Type"
              disabled
            />

            <RHFTextField
              type="number"
              name={`materials[${index}].quantity`}
              label="Quantity"
              onChange={(e) => {
                setValue(`materials[${index}].quantity`, e.target.value);
              }}
              disabled
            />
            <RHFSelect name={`materials[${index}].billingUnit`} label="Billing Unit" disabled>
              <MenuItem key="kg" value="kg">
                Kg
              </MenuItem>
              <MenuItem key="nos" value="nos">
                Nos
              </MenuItem>
            </RHFSelect>
            <Controller
              name={`materials[${index}].hsnNo`}
              control={control}
              render={({
                field: { onChange, value: fieldValue, ...fieldProps },
                fieldState: { error },
              }) => (
                <Autocomplete
                  {...fieldProps}
                  options={hsnMasters}
                  getOptionLabel={(option) => (option ? option.hsnCode : '')}
                  isOptionEqualToValue={(option, value) => option.hsnCode === value.hsnCode}
                  onChange={(_, selectedOption) => {
                    onChange(selectedOption);
                    if (selectedOption) {
                      setValue(`materials[${index}].tax`, selectedOption.tax || 0);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Hsn"
                      fullWidth
                      sx={{ flex: 2 }}
                      error={!!error}
                      helperText={error ? error?.message : ''}
                    />
                  )}
                  value={fieldValue || null}
                  sx={{
                    width: '100%',
                  }}
                  disabled
                />
              )}
            />

            <RHFTextField
              name={`materials[${index}].tax`}
              label="Tax"
              sx={{
                width: '50%',
              }}
              disabled
            />

            <RHFTextField name={`materials[${index}].microns`} label="Microns" disabled />

            <RHFTextField
              name={`materials[${index}].pricePerUnit`}
              label="Price Per Unit"
              onChange={(e) => {
                setValue(`materials[${index}].pricePerUnit`, e.target.value);
              }}
              disabled
            />

            <RHFTextField
              name={`materials[${index}].priceAfterTax`}
              label="Price After Tax"
              disabled
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
  useEffect(() => {
    if (currentChallan) {
      console.log(currentChallan.quotation);
      setQuotationOptions([currentChallan.quotation]);
      setValue('quotation', currentChallan.quotation);
    }
  }, [currentChallan, setValue]);

  useEffect(() => {
    if (quotationDetails) {
      setValue('materials', quotationDetails.materials);
    }
  }, [quotationDetails, setValue]);

  useEffect(() => {
    if (currentChallan) {
      reset(defaultValues);
    }
  }, [currentChallan, defaultValues, reset]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <RHFAutocomplete
                  name="quotation"
                  label="RFQ Reference"
                  onInputChange={(event) => fetchQuotations(event)}
                  options={quotationOptions}
                  getOptionLabel={(option) => `${formatRFQId(option.id)}` || ''}
                  filterOptions={(x) => x}
                  disabled
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${formatRFQId(option.id)}`}
                      </Typography>
                    </li>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField name="vehicleNumber" label="Vehicle Number" disabled />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField type="number" name="grossWeight" label="Gross Weight" disabled />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField type="number" name="tareWeight" label="Tare Weight" disabled />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField type="number" name="netWeight" label="Net Weight" disabled />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField name="poNumber" label="PO Number" disabled />
              </Grid>

              <Grid item xs={12}>
                <RHFTextField name="remark" label="Remark" multiline rows={3} disabled />
              </Grid>
            </Grid>

            <Box mt={5}>{renderMaterialDetailsForm}</Box>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ChallanViewForm.propTypes = {
  currentChallan: PropTypes.object,
};
