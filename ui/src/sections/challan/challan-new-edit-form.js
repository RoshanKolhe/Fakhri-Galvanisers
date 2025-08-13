/* eslint-disable no-unreachable */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFTextField,
  RHFUpload,
  RHFUploadBox,
} from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { formatRFQId } from 'src/utils/constants';
import { Autocomplete, Button, Chip, MenuItem, TextField, Typography } from '@mui/material';
import { useGetHsnMasters } from 'src/api/hsnMaster';
import Iconify from 'src/components/iconify';
import { useGetItemsMasters } from 'src/api/itemsMaster';
import { useAuthContext } from 'src/auth/hooks';
import { MultiFilePreview } from 'src/components/upload';

// ----------------------------------------------------------------------

export default function ChallanNewEditForm({ currentChallan }) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [quotationOptions, setQuotationOptions] = useState([]);
  const { hsnMasters, hsnMastersLoading, hsnMastersEmpty, refreshQuotations } = useGetHsnMasters();
  const { itemsMasters } = useGetItemsMasters();
  const [customerOptions, setCustomerOptions] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const NewChallanSchema = Yup.object().shape({
    customerName: Yup.object().required('Customer Name is Required'),
    quotation: Yup.object().nullable(),
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
    challanImages: Yup.array().nullable(),
    poImages: Yup.array().nullable(),
    vehicleImages: Yup.array().nullable(),
    materialImages: Yup.array().nullable(),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          itemType: Yup.object().required('Material Type is required'),
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
    status: Yup.number(),
  });

  const defaultValues = useMemo(
    () => ({
      // eslint-disable-next-line no-nested-ternary
      customerName: currentChallan?.customer ? currentChallan.customer : user?.permissions?.includes('customer') ? user : null,
      quotation: currentChallan?.quotation || null,
      vehicleNumber: currentChallan?.vehicleNumber || '',
      grossWeight: currentChallan?.grossWeight || 0,
      tareWeight: currentChallan?.tareWeight || 0,
      netWeight: currentChallan?.netWeight || 0,
      poNumber: currentChallan?.poNumber || '',
      challanImages: currentChallan?.challanImages || [],
      poImages: currentChallan?.poImages || [],
      vehicleImages: currentChallan?.vehicleImages || [],
      materialImages: currentChallan?.materialImages || [],
      materials: currentChallan?.materials?.length
        ? currentChallan.materials.map((material) => ({
          itemType: material.itemType ? material.itemType : null,
          materialType: material.materialType || '',
          quantity: material.quantity || null,
          billingUnit: material.billingUnit || '',
          hsnNo: material.hsnNo || null,
          microns: material.microns || 0,
          tax: material.tax || 0,
          pricePerUnit: material.pricePerUnit || 0,
          priceAfterTax: material.priceAfterTax || 0,
        }))
        : [{
          itemType: null,
          materialType: '',
          quantity: null,
          billingUnit: '',
          hsnNo: null,
          microns: 0,
          tax: 0,
          pricePerUnit: 0,
          priceAfterTax: 0,
        }],
      status: currentChallan?.status || 0,
      remark: currentChallan?.remark || '',
    }),
    [currentChallan, user]
  );

  console.log('materials', currentChallan?.materials);

  const methods = useForm({
    resolver: yupResolver(NewChallanSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });
  const quotationDetails = watch('quotation');

  const materials = watch('materials');
  const values = watch();

  const fetchQuotations = async (event) => {
    console.log(event?.target?.value);
    try {
      if (event && event.target.value) {
        const filter = {
          where: {
            id: { like: `%${event.target.value}%` },
            status: 1,
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
        quotationId: formData?.quotation?.id || undefined,
        customerId: formData.customerName.id,
        status: formData.status ? formData.status : 0,
        materials: formData.materials,
        challanImages: formData.challanImages || [],
        poImages: formData.poImages || [],
        vehicleImages: formData.vehicleImages || [],
        materialImages: formData.materialImages || [],
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

  const calculatePriceAfterTax = (index) => {
    const pricePerUnit = parseFloat(materials[index]?.pricePerUnit) || 0;
    const quantity = parseFloat(materials[index]?.quantity) || 0;
    const tax = parseFloat(materials[index]?.tax) || 0;

    if (pricePerUnit && quantity) {
      const totalPrice = pricePerUnit * quantity;
      const priceAfterTax = totalPrice * (1 + tax / 100);

      setValue(`materials[${index}].priceAfterTax`, priceAfterTax.toFixed(2), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  useEffect(() => {
    if (
      currentChallan &&
      currentChallan.materials?.length > 0 &&
      itemsMasters?.length > 0
    ) {
      currentChallan.materials.forEach((material, index) => {
        const matchedItem = itemsMasters.find(
          (item) => item.materialType === material?.materialType
        );

        console.log('matchedItem', matchedItem);
        if (matchedItem) {
          console.log('entered');
          setValue(`materials[${index}].itemType`, matchedItem, { shouldValidate: true, shouldDirty: true });
        }
      });
    }
  }, [currentChallan, itemsMasters, setValue]);

  const renderMaterialDetailsForm = (
    <Stack spacing={3} mt={2}>
      {fields.map((item, index) => (
        <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <Controller
              name={`materials[${index}].itemType`}
              control={control}
              render={({
                field: { onChange, value: fieldValue, ...fieldProps },
                fieldState: { error },
              }) => {
                // Watch all selected itemTypes in materials (skip current index)
                const selectedItemIds = watch('materials')
                  ?.map((mat, i) => mat?.itemType?.id)
                  .filter(Boolean);

                console.log('materials', watch('materials'));
                console.log('selectedItemsIds', selectedItemIds);

                return (
                  <Autocomplete
                    {...fieldProps}
                    options={itemsMasters}
                    getOptionLabel={(option) => option?.materialType || ''}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    onChange={(_, selectedOption) => {
                      onChange(selectedOption);
                      if (selectedOption) {
                        setValue(`materials[${index}].materialType`, selectedOption.materialType || '');
                        setValue(`materials[${index}].hsnNo`, selectedOption.hsnMaster || {});
                        setValue(`materials[${index}].tax`, selectedOption.hsnMaster?.tax || 0);
                      }
                    }}
                    getOptionDisabled={(option) => selectedItemIds.includes(option.id)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Material Type"
                        fullWidth
                        sx={{ flex: 2 }}
                        error={!!error}
                        helperText={error?.message || ''}
                      />
                    )}
                    value={fieldValue || null}
                    sx={{ width: '100%' }}
                  />
                );
              }}
            />

            <RHFTextField
              type="number"
              name={`materials[${index}].quantity`}
              label="Quantity"
              onChange={(e) => {
                setValue(`materials[${index}].quantity`, e.target.value);
                calculatePriceAfterTax(index);
              }}
            />
            <RHFSelect name={`materials[${index}].billingUnit`} label="Billing Unit">
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
                  isOptionEqualToValue={(option, value) => option.id === value.id}
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

            <RHFTextField name={`materials[${index}].microns`} label="Microns" />

            <RHFTextField
              name={`materials[${index}].pricePerUnit`}
              label="Price Per Unit"
              onChange={(e) => {
                setValue(`materials[${index}].pricePerUnit`, e.target.value);
                calculatePriceAfterTax(index);
              }}
            />

            <RHFTextField
              name={`materials[${index}].priceAfterTax`}
              label="Price After Tax"
              disabled
            />
          </Stack>
          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </Stack>

      ))}

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() =>
            append({
              materialType: '',
              quantity: null,
              billingUnit: '',
              hsnNo: null,
              microns: 0,
              tax: 0,
              pricePerUnit: 0,
              priceAfterTax: 0,
            })
          }
          sx={{ flexShrink: 0 }}
        >
          Add Item
        </Button>
      </Stack>
    </Stack>
  );

  const handleDrop = useCallback(
    async (acceptedFiles, fieldName) => {
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

        // Get the current images from the form
        const currentImages = getValues(`${fieldName}`) || [];
        // Merge new images with existing ones
        setValue(`${fieldName}`, [...currentImages, ...newFiles], {
          shouldValidate: true,
        });
      } catch (err) {
        console.error('Error uploading files:', err);
      }
    },
    [getValues, setValue]
  );


  const fetchCustomers = async (event) => {
    try {
      if (event && event?.target?.value && event.target.value.length >= 3) {
        const filter = {
          where: {
            or: [
              { email: { like: `%${event.target.value}%` } },
              { firstName: { like: `%${event.target.value}%` } },
              { lastName: { like: `%${event.target.value}%` } },
              { phoneNumber: { like: `%${event.target.value}%` } },
            ],
          },
        };
        const filterString = encodeURIComponent(JSON.stringify(filter));
        const { data } = await axiosInstance.get(`/customer/list?filter=${filterString}`);
        setCustomerOptions(data);
        console.log(data);
      } else {
        setCustomerOptions([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFile = useCallback(
    (inputFile, fieldName) => {
      const currentFiles = values[fieldName] || [];
      const filtered = currentFiles.filter((file) => file !== inputFile);
      setValue(fieldName, filtered);
    },
    [setValue, values]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  useEffect(() => {
    if (currentChallan) {
      console.log(currentChallan.quotation);
      setQuotationOptions([currentChallan.quotation]);
      setValue('quotation', currentChallan.quotation);
    }
  }, [currentChallan, setValue]);

  useEffect(() => {
    if (quotationDetails && !currentChallan) {
      setValue('materials', quotationDetails.materials);
    }
  }, [currentChallan, quotationDetails, setValue]);

  useEffect(() => {
    if (currentChallan) {
      reset(defaultValues);
    }
  }, [currentChallan, defaultValues, reset]);

  console.log('permission', user?.permissions?.includes('customer'));

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {!user?.permissions?.includes('customer') && <Grid item xs={12} sm={4}>
                <RHFAutocomplete
                  name="customerName"
                  label="Customer Name"
                  onInputChange={(event) => fetchCustomers(event)}
                  options={customerOptions}
                  getOptionLabel={(option) => `${option?.firstName} ${option?.lastName}` || ''}
                  filterOptions={(x) => x}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {`${option?.firstName} ${option?.lastName}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {option.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {option.phoneNumber}
                        </Typography>
                      </div>
                    </li>
                  )}
                />
              </Grid>}
              <Grid item xs={12} sm={6} md={4}>
                <RHFAutocomplete
                  name="quotation"
                  label="RFQ Reference"
                  onInputChange={(event) => fetchQuotations(event)}
                  options={quotationOptions}
                  getOptionLabel={(option) => option?.id ? `${formatRFQId(option.id)}` : ''}
                  filterOptions={(x) => x}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {option?.id ? `${formatRFQId(option?.id)}` : ''}
                      </Typography>
                    </li>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField name="vehicleNumber" label="Vehicle Number" />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField type="number" name="grossWeight" label="Gross Weight" />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField type="number" name="tareWeight" label="Tare Weight" />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField type="number" name="netWeight" label="Net Weight" />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <RHFTextField name="poNumber" label="PO Number" />
              </Grid>

              <Grid item xs={12}>
                <RHFTextField name="remark" label="Remark" multiline rows={3} />
              </Grid>
            </Grid>

            <Box mt={5}>{renderMaterialDetailsForm}</Box>

            <Grid container spacing={2} mt={5}>

              {/* challan images */}
              <Grid item md={3} xs={12}>

                <Box component='div' sx={{ my: 2 }}>
                  <Typography variant='body1'>
                    Upload challan images
                  </Typography>
                </Box>

                <RHFUploadBox
                  multiple
                  thumbnail
                  name="challanImages"
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
                  onDrop={(acceptedFiles) => {
                    handleDrop(acceptedFiles, 'challanImages');
                  }}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  sx={{ mb: 3 }}
                />
                {values.challanImages?.length > 0 && <MultiFilePreview files={values.challanImages} onRemove={(file) => handleRemoveFile(file, 'challanImages')} onRemoveAll={handleRemoveAllFiles} thumbnail/>}
              </Grid>

              {/* PO images */}
              <Grid item md={3} xs={12}>

                <Box component='div' sx={{ my: 2 }}>
                  <Typography variant='body1'>
                    Upload PO images
                  </Typography>
                </Box>

                <RHFUploadBox
                  multiple
                  thumbnail
                  name="poImages"
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
                  onDrop={(acceptedFiles) => {
                    handleDrop(acceptedFiles, 'poImages');
                  }}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  sx={{ mb: 3 }}
                />
                {values.poImages?.length > 0 && <MultiFilePreview files={values.poImages} onRemove={(file) => handleRemoveFile(file, 'poImages')} onRemoveAll={handleRemoveAllFiles} thumbnail/>}
              </Grid>

              {/* Vehicle images */}
              <Grid item md={3} xs={12}>

                <Box component='div' sx={{ my: 2 }}>
                  <Typography variant='body1'>
                    Upload vehicle images
                  </Typography>
                </Box>

                <RHFUploadBox
                  multiple
                  thumbnail
                  name="vehicleImages"
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
                  onDrop={(acceptedFiles) => {
                    handleDrop(acceptedFiles, 'vehicleImages');
                  }}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  sx={{ mb: 3 }}
                />
                {values.vehicleImages?.length > 0 && <MultiFilePreview files={values.vehicleImages} onRemove={(file) => handleRemoveFile(file, 'vehicleImages')} onRemoveAll={handleRemoveAllFiles} thumbnail/>}
              </Grid>

              {/* Material images */}
              <Grid item md={3} xs={12}>

                <Box component='div' sx={{ my: 2 }}>
                  <Typography variant='body1'>
                    Upload material images
                  </Typography>
                </Box>

                <RHFUploadBox
                  multiple
                  thumbnail
                  name="materialImages"
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
                  onDrop={(acceptedFiles) => {
                    handleDrop(acceptedFiles, 'materialImages');
                  }}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  sx={{ mb: 3 }}
                />
                {values.materialImages?.length > 0 && <MultiFilePreview files={values.materialImages} onRemove={(file) => handleRemoveFile(file, 'materialImages')} onRemoveAll={handleRemoveAllFiles} thumbnail/>}
              </Grid>
            </Grid>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentChallan ? 'Create Challan' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ChallanNewEditForm.propTypes = {
  currentChallan: PropTypes.object,
};
