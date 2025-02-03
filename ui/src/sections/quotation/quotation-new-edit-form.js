/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// utils
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete, RHFSelect } from 'src/components/hook-form';
import { Autocomplete, Box, MenuItem, TableCell, TableRow, TextField } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { useGetHsnMasters } from 'src/api/hsnMaster';
import { useAuthContext } from 'src/auth/hooks';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function QuotationNewEditForm({ currentQuotation }) {
  const router = useRouter();
  const [customerOptions, setCustomerOptions] = useState([]);
  const [status, setStatus] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  const { hsnMasters, hsnMastersLoading, hsnMastersEmpty, refreshQuotations } = useGetHsnMasters();

  const NewQuotationSchema = Yup.object().shape({
    customerName: Yup.object().nullable(),
    firstname: Yup.string(),
    lastName: Yup.string(),
    gstNo: Yup.string(),
    phoneNumber: Yup.string(),
    company: Yup.string(),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          materialType: Yup.string().required('Material type is required'),
          quantity: Yup.number().required('Quantity in  required'),
          billingUnit: Yup.string().required('Billing Unit is required'),
          hsnNo: isAdmin ? Yup.object().required('Hsn is required') : Yup.object().nullable(),
          microns: Yup.number().required('Microns is required'),
          tax: isAdmin ? Yup.number().required('Tax is required') : Yup.number().nullable(),
          pricePerUnit: isAdmin
            ? Yup.number().required('Price is required')
            : Yup.number().nullable(),
          priceAfterTax: isAdmin
            ? Yup.number().required('Price After Tax is required')
            : Yup.number().nullable(),
        })
      )
      .min(1, 'At least one material is required'),
  });

  const defaultValues = useMemo(
    () => ({
      customerName: null,
      firstName: currentQuotation
        ? currentQuotation?.customer?.firstName
        : !isAdmin
        ? user?.firstName
        : '',
      lastName: currentQuotation
        ? currentQuotation?.customer?.lastName
        : !isAdmin
        ? user?.lastName
        : '',
      gstNo: currentQuotation ? currentQuotation?.customer?.gstNo : !isAdmin ? user?.gstNo : '',
      phoneNumber: currentQuotation
        ? currentQuotation?.customer?.phoneNumber
        : !isAdmin
        ? user?.phoneNumber
        : '',
      company: currentQuotation
        ? currentQuotation?.customer?.company
        : !isAdmin
        ? user?.company
        : '',
      adminNote: currentQuotation?.adminNote || '',
      customerNote: currentQuotation?.customerNote || '',
      materials: currentQuotation?.materials?.length
        ? currentQuotation.materials.map((material) => ({
            materialType: material.materialType || '',
            quantity: material.quantity || null,
            billingUnit: material.billingUnit || '',
            hsnNo: material.hsnNo || null,
            microns: material.microns || 0,
            tax: material.tax || 0,
            pricePerUnit: material.pricePerUnit || 0,
            priceAfterTax: material.priceAfterTax || 0,
          }))
        : [
            {
              materialType: '',
              quantity: null,
              billingUnit: '',
              hsnNo: null,
              microns: 0,
              tax: 0,
              pricePerUnit: 0,
              priceAfterTax: 0,
            },
          ],
    }),
    [currentQuotation, isAdmin, user]
  );

  const methods = useForm({
    resolver: yupResolver(NewQuotationSchema),
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });

  const values = watch();
  const customerName = watch('customerName');
  const materials = watch('materials');

  const calculateTotals = (allMaterials) => {
    let subtotal = 0;
    let totalTax = 0;
    let grandTotal = 0;

    allMaterials.forEach((material) => {
      const pricePerUnit = parseFloat(material?.pricePerUnit) || 0;
      const quantity = parseFloat(material?.quantity) || 0;
      const tax = parseFloat(material?.tax) || 0;
      if (pricePerUnit && quantity) {
        const totalPrice = pricePerUnit * quantity;
        const taxAmount = (totalPrice * tax) / 100;

        subtotal += totalPrice;
        totalTax += taxAmount;
        grandTotal += totalPrice + taxAmount;
      }
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };

  const totals = calculateTotals(materials);
  console.log(totals);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);
      const inputData = {
        customerId: customerName ? customerName.id : user.id,
        adminNote: formData.adminNote,
        customerNote: formData.customerNote,
        materials: formData.materials,
        status: isAdmin ? 2 : 4,
      };
      if (!currentQuotation) {
        await axiosInstance.post('/quotations', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/quotations/${currentQuotation.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentQuotation ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.quotation.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

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

  const calculatePriceAfterTax = (index) => {
    console.log(index);
    const pricePerUnit = parseFloat(materials[index]?.pricePerUnit) || 0;
    const quantity = parseFloat(materials[index]?.quantity) || 0;
    const tax = parseFloat(materials[index]?.tax) || 0;

    console.log(pricePerUnit, quantity);

    if (pricePerUnit && quantity) {
      const totalPrice = pricePerUnit * quantity;
      const priceAfterTax = totalPrice * (1 + tax / 100);

      setValue(`materials[${index}].priceAfterTax`, priceAfterTax.toFixed(2), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const renderMaterialDetailsForm = (
    <Stack spacing={3} mt={2}>
      {fields.map((item, index) => (
        <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFTextField name={`materials[${index}].materialType`} label="Material Type" />

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
            {isAdmin || values.materials[index].hsnNo ? (
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
                        calculatePriceAfterTax(index);
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
            ) : null}

            {isAdmin || values.materials[index].tax ? (
              <RHFTextField
                name={`materials[${index}].tax`}
                label="Tax"
                sx={{
                  width: '50%',
                }}
                disabled
              />
            ) : null}

            <RHFTextField name={`materials[${index}].microns`} label="Microns" />

            {isAdmin || values.materials[index].pricePerUnit ? (
              <RHFTextField
                name={`materials[${index}].pricePerUnit`}
                label="Price Per Unit"
                onChange={(e) => {
                  console.log(`here-${e.target.value}`);
                  setValue(`materials[${index}].pricePerUnit`, e.target.value);
                  calculatePriceAfterTax(index);
                }}
              />
            ) : null}

            {isAdmin || values.materials[index].priceAfterTax ? (
              <RHFTextField
                name={`materials[${index}].priceAfterTax`}
                label="Price After Tax"
                disabled
              />
            ) : null}
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

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(totals.subtotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totals.totalTax) || '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totals.grandTotal) || '-'}</Box>
      </Stack>
    </Stack>
  );

  useEffect(() => {
    if (currentQuotation) {
      reset(defaultValues);
    }
  }, [currentQuotation, defaultValues, reset]);

  useEffect(() => {
    if (customerName) {
      setValue('firstName', customerName.firstName);
      setValue('lastName', customerName.lastName);
      setValue('gstNo', customerName.gstNo);
      setValue('phoneNumber', customerName.phoneNumber);
      setValue('company', customerName.company);
    }
  }, [customerName, setValue]);

  useEffect(() => {
    if (currentQuotation) {
      setCustomerOptions([currentQuotation.customer]);
      setValue('customerName', currentQuotation.customer);
    }
  }, [currentQuotation, setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {isAdmin ? (
                  <RHFAutocomplete
                    name="customerName"
                    label="Customer Name"
                    onInputChange={(event) => fetchCustomers(event)}
                    options={customerOptions}
                    getOptionLabel={(option) => `${option?.firstName} ${option?.lastName}` || ''}
                    filterOptions={(x) => x}
                    renderInput={(params) => <TextField {...params} label="Customer Name" />}
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
                ) : null}
              </Grid>
              <Grid item xs={12} sm={6} />
              <Grid item xs={12} sm={6}>
                <RHFTextField name="firstName" label="First Name" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="lastName" label="Last Name" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="phoneNumber" label="Contact Details" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="company" label="Company" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="gstNo" label="Gst No" disabled />
              </Grid>
            </Grid>
            {renderMaterialDetailsForm}
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} sm={12}>
                {isAdmin || values.adminNote ? (
                  <RHFTextField
                    name="adminNote"
                    label="Admin Note"
                    multiline
                    rows={3}
                    disabled={!isAdmin}
                  />
                ) : null}
              </Grid>
              <Grid item xs={12} sm={12}>
                <RHFTextField name="customerNote" label="Customer Note" multiline rows={3} />
              </Grid>
            </Grid>
            {renderTotal}
            <Stack justifyContent="end" direction="row" spacing={2} sx={{ mt: 3 }}>
              <LoadingButton type="button" variant="outlined" loading={isSubmitting}>
                Save Draft
              </LoadingButton>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Send Quotation
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

QuotationNewEditForm.propTypes = {
  currentQuotation: PropTypes.object,
};
