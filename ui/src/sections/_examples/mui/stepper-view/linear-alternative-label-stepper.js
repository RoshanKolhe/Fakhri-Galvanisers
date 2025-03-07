import { useState } from 'react';
import * as Yup from 'yup';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import LoadingButton from '@mui/lab/LoadingButton';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import { Stack, IconButton, Grid, MenuItem } from '@mui/material';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

const steps = ['User Details', 'Material Details'];

export default function LinearAlternativeLabel() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [inquiryId, setInquiryId] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    company: Yup.string().required('Company is required'),
    gstIn: Yup.string().required('Gst In is required'),
    designation: Yup.string().required('Designation is required'),
    address: Yup.string().required('Address is required'),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          materialType: Yup.string().required('Material type is required'),
          quantity: Yup.number().required('Quantity in Nos is required'),
          billingUnit: Yup.string().required('Billing Unit is required'),
          microns: Yup.number().required('Microns is required'),
        })
      )
      .min(1, 'At least one material is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    gstIn: '',
    designation: '',
    address: '',
    materials: [{ materialType: '', quantity: undefined, billingUnit: '', microns: undefined }],
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const inputData = {
        ...formData,
        status: 1,
      };
      if (inquiryId) {
        await axiosInstance.patch(`/inquiries/${inquiryId}`, inputData);
      } else {
        await axiosInstance.post('/inquiries', inputData);
      }
      enqueueSnackbar(
        'Thank you for submitting your RFQ. Our team will get in touch with you shortly.'
      );
      router.replace(paths.auth.jwt.customerLogin);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleNext = async () => {
    // Validate the form for the current step
    let isStepValid = false;

    if (activeStep === 0) {
      // Validate fields for Step 1
      isStepValid = await methods.trigger([
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'company',
        'gstIn',
        'designation',
        'address',
      ]);
    } else if (activeStep === 1) {
      isStepValid = await methods.trigger(['materials']);
    }
    if (!isStepValid) {
      console.error('Validation failed:', methods.formState.errors);
      return;
    }
    console.log(isStepValid);
    if (isStepValid) {
      if (activeStep === 0) {
        try {
          const userDetails = methods.getValues();
          const inputData = {
            ...userDetails,
            phoneNumber: `${userDetails.phoneNumber}`,
            status: 0,
          };
          delete inputData.materials;
          console.log(inputData);
          if (inquiryId) {
            await axiosInstance.patch(`/inquiries/${inquiryId}`, inputData);
          } else {
            const { data } = await axiosInstance.post('/inquiries', inputData);
            setInquiryId(data.id);
          }
        } catch (error) {
          console.error('Error saving user details:', error);
          enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
            variant: 'error',
          });
          return;
        }
      }

      // Move to the next step
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const renderUserDetailsForm = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="firstName" label="First name" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="lastName" label="Last name" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField type="number" name="phoneNumber" label="Contact Number" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="designation" label="Designation" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="email" label="Email address" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="company" label="Company" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="gstIn" label="GstIn" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="address" label="Address" />
      </Grid>
    </Grid>
  );

  const renderMaterialDetailsForm = (
    <Stack spacing={3}>
      {fields.map((field, index) => (
        <Grid container spacing={2} key={field.id} alignItems="center">
          <Grid item xs={12} sm={3}>
            <RHFTextField name={`materials[${index}].materialType`} label="Material Type" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <RHFTextField
              type="number"
              name={`materials[${index}].quantity`}
              label="Quantity"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <RHFSelect name={`materials[${index}].billingUnit`} label="Billing Unit">
              <MenuItem key="kg" value="kg">
                Kg
              </MenuItem>
              <MenuItem key="nos" value="nos">
                Nos
              </MenuItem>
            </RHFSelect>
          </Grid>
          <Grid item xs={12} sm={2}>
            <RHFTextField name={`materials[${index}].microns`} label="Microns" />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton onClick={() => remove(index)} color="error">
              <Iconify icon="mdi:delete" width={24} height={24} />
            </IconButton>
          </Grid>
        </Grid>
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
            append({ materialType: '', quantityInNos: null, quantityInKg: null, microns: null })
          }
          sx={{ flexShrink: 0 }}
        >
          Add Item
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Paper
            sx={{
              p: 3,
              my: 3,
              minHeight: 120,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
            }}
          >
            <Typography sx={{ my: 1 }}>All steps completed - you&apos;re finished</Typography>
          </Paper>

          <Box sx={{ display: 'flex' }}>
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          {activeStep === 0 && renderUserDetailsForm}
          {activeStep === 1 && renderMaterialDetailsForm}

          <Box sx={{ display: 'flex', mt: 3 }}>
            <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {activeStep === steps.length - 1 ? (
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Submit
              </LoadingButton>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </FormProvider>
      )}
    </>
  );
}
