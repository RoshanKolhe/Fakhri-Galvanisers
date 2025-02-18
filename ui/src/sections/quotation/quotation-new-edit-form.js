/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFSelect,
  RHFUpload,
} from 'src/components/hook-form';
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
} from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { useGetHsnMasters } from 'src/api/hsnMaster';
import { useAuthContext } from 'src/auth/hooks';
import { fCurrency } from 'src/utils/format-number';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { current } from '@reduxjs/toolkit';
import { formatRFQId } from 'src/utils/constants';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function QuotationNewEditForm({ currentQuotation }) {
  const router = useRouter();
  const [customerOptions, setCustomerOptions] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useBoolean();
  const poDocModal = useBoolean();
  const [rejectError, setRejectError] = useState(false);
  const [poDoc, setPoDoc] = useState(false);

  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  const { hsnMasters, hsnMastersLoading, hsnMastersEmpty, refreshQuotations } = useGetHsnMasters();

  const NewQuotationSchema = Yup.object().shape({
    customerName: isAdmin
      ? Yup.object().required('Customer Name is Required')
      : Yup.object().nullable(),
    firstname: Yup.string(),
    lastName: Yup.string(),
    gstNo: Yup.string(),
    phoneNumber: Yup.string(),
    company: Yup.string(),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          materialType: Yup.string().required('Material type is required'),
          quantity: Yup.number().required('Quantity is  required'),
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
        setPoDoc(data?.files[0]);
        setValue('poDoc', data?.files[0].fileUrl, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('poDoc', null);
  }, [setValue]);

  // const handleSaveDraft = async () => {
  //   try {
  //     const isValidDraft = await methods.trigger(['customerName']);
  //     if (!isValidDraft) {
  //       console.error('Validation failed:', methods.formState.errors);
  //       // eslint-disable-next-line no-useless-return
  //       return;
  //     }
  //     const draftDetails = methods.getValues();
  //     const inputData = {
  //       ...draftDetails,
  //       status: 0,
  //     };
  //     await axiosInstance.post('/quotations', inputData);
  //     reset();
  //     enqueueSnackbar('Draft Saved Successfully');
  //     router.push(paths.dashboard.quotation.list);
  //   } catch (error) {
  //     console.error('Error saving user details:', error);
  //     enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
  //       variant: 'error',
  //     });
  //   }
  // };

  const handleQuoteRejection = async () => {
    setLoading(true);
    try {
      const inputData = {
        rejectedReason: rejectReason,
        status: 3,
      };
      await axiosInstance.patch(`/quotations/${currentQuotation.id}`, inputData);
      enqueueSnackbar('Quotation Rejected Successfully');
      setRejectError(false);
      confirm.onFalse();
      router.push(paths.dashboard.quotation.list);
    } catch (error) {
      console.error('Error saving user details:', error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
      confirm.onFalse();
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuotation = async () => {
    setLoading(true);
    try {
      const inputData = {
        status: 1,
      };
      if (poDoc) {
        inputData.poDoc = poDoc;
      }
      await axiosInstance.patch(`/quotations/${currentQuotation.id}`, inputData);
      poDocModal.onFalse();
      enqueueSnackbar('Quotation Approved Successfully');
      router.push(paths.dashboard.quotation.list);
    } catch (error) {
      console.error('Error saving user details:', error);
      poDocModal.onFalse();
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMaterialDetailsForm = (
    <Stack spacing={3} mt={2}>
      {fields.map((item, index) => (
        <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFTextField
              name={`materials[${index}].materialType`}
              label="Material Type"
              disabled={!isAdmin && currentQuotation && currentQuotation?.status !== 4}
            />

            <RHFTextField
              type="number"
              name={`materials[${index}].quantity`}
              label="Quantity"
              onChange={(e) => {
                setValue(`materials[${index}].quantity`, e.target.value);
                calculatePriceAfterTax(index);
              }}
              disabled={!isAdmin && currentQuotation && currentQuotation?.status !== 4}
            />
            <RHFSelect
              name={`materials[${index}].billingUnit`}
              label="Billing Unit"
              disabled={!isAdmin && currentQuotation && currentQuotation?.status !== 4}
            >
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
                    disabled={!isAdmin && currentQuotation && currentQuotation?.status !== 4}
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

            <RHFTextField
              name={`materials[${index}].microns`}
              label="Microns"
              disabled={!isAdmin && currentQuotation && currentQuotation?.status !== 4}
            />

            {isAdmin || values.materials[index].pricePerUnit ? (
              <RHFTextField
                name={`materials[${index}].pricePerUnit`}
                label="Price Per Unit"
                onChange={(e) => {
                  setValue(`materials[${index}].pricePerUnit`, e.target.value);
                  calculatePriceAfterTax(index);
                }}
                disabled={!isAdmin && currentQuotation && currentQuotation?.status !== 4}
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
          {!isAdmin && currentQuotation && currentQuotation?.status !== 4 ? null : (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          )}
        </Stack>
      ))}
      {!isAdmin && currentQuotation && currentQuotation?.status !== 4 ? null : (
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
      )}
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
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              {currentQuotation ? (
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="h5" gutterBottom>
                    {currentQuotation && formatRFQId(currentQuotation?.id)}
                    <Label
                      color={
                        (currentQuotation?.status === 1 && 'success') ||
                        (currentQuotation?.status === 3 && 'error') ||
                        (currentQuotation?.status === 2 && 'warning') ||
                        (currentQuotation?.status === 3 && 'warning') ||
                        'warning'
                      }
                      sx={{ marginLeft: '10px' }}
                    >
                      {(currentQuotation?.status === 1 && 'Approved') ||
                        (currentQuotation?.status === 2 && 'Pending Approval') ||
                        (currentQuotation?.status === 3 && 'Rejected') ||
                        (currentQuotation?.status === 4 && 'Created')}
                    </Label>
                  </Typography>

                  {currentQuotation && currentQuotation?.poDoc && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        window.open(currentQuotation.poDoc.fileUrl, '_blank', 'noopener,noreferrer')
                      }
                    >
                      View Doc
                    </Button>
                  )}
                </Stack>
              ) : null}

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
              {currentQuotation ? renderTotal : null}
              <Stack
                justifyContent="end"
                direction={{ xs: 'column', sm: 'row' }} // Column on mobile, Row on larger screens
                spacing={2}
                sx={{ mt: 3, width: '100%' }} // Ensures full width usage
              >
                {/* {!currentQuotation || (currentQuotation && currentQuotation.status === 0) ? (
      <LoadingButton
        type="button"
        variant="outlined"
        loading={isSubmitting}
        onClick={() => {
          handleSaveDraft();
        }}
      >
        Save Draft
      </LoadingButton>
    ) : null} */}
                {isAdmin ||
                !currentQuotation ||
                (currentQuotation && currentQuotation?.status === 4) ? (
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Send Quotation
                  </LoadingButton>
                ) : null}

                {!isAdmin && currentQuotation && currentQuotation?.status !== 4 ? (
                  <Button
                    color="error"
                    variant="contained"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={() => {
                      console.log('remove');
                      confirm.onTrue();
                    }}
                    disabled={currentQuotation?.status === 3}
                  >
                    Reject Quote
                  </Button>
                ) : null}
                {!isAdmin && currentQuotation && currentQuotation?.status !== 4 ? (
                  <Button
                    color="success"
                    variant="contained"
                    startIcon={<Iconify icon="ic:baseline-whatsapp" />}
                    onClick={() => {
                      console.log('contact');
                    }}
                  >
                    Contact Hylite
                  </Button>
                ) : null}
                {!isAdmin && currentQuotation && currentQuotation?.status !== 4 ? (
                  <LoadingButton
                    type="button"
                    variant="contained"
                    loading={loading}
                    disabled={currentQuotation?.status === 1}
                    onClick={() => {
                      poDocModal.onTrue();
                    }}
                  >
                    Approve Quote
                  </LoadingButton>
                ) : null}
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <Dialog fullWidth maxWidth="sm" open={poDocModal.value} onClose={poDocModal.onFalse}>
          <DialogContent sx={{ typography: 'body2' }}>
            <RHFUpload
              sx={{ marginTop: '30px' }}
              name="poDoc"
              maxSize={3145728}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
            />
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" color="inherit" onClick={poDocModal.onFalse}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleApproveQuotation();
              }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </FormProvider>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:bell-bing-bold" />
            <span>Wait! Let’s Talk Before You Decide.</span>
          </Stack>
        }
        content={
          <Stack spacing={2}>
            <span>Got concerns? Request a callback, and we will address them right away!</span>
            <TextField
              label="Reason for rejection"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectError) setRejectError(false);
              }}
              error={rejectError}
              helperText={rejectError ? 'Please provide a reason for rejection.' : ''}
            />
          </Stack>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={loading}
            onClick={() => {
              if (!rejectReason.trim()) {
                setRejectError(true);
                return;
              }
              handleQuoteRejection();
            }}
          >
            Reject Quote
          </LoadingButton>
        }
      />
    </>
  );
}

QuotationNewEditForm.propTypes = {
  currentQuotation: PropTypes.object,
};
