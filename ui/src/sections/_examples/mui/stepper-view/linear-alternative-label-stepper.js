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
import { Stack, IconButton, Grid } from '@mui/material';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const steps = ['User Details', 'Material Details'];

export default function LinearAlternativeLabel() {
  const [activeStep, setActiveStep] = useState(0);
  const [userId, setUserId] = useState(null);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          materialType: Yup.string().required('Material type is required'),
          quantityInNos: Yup.number().required('Quantity in Nos is required'),
          quantityInKg: Yup.number().required('Quantity in Kg is required'),
          microns: Yup.number().required('Microns is required'),
        })
      )
      .min(1, 'At least one material is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    materials: [{ materialType: '', quantityInNos: null, quantityInKg: null, microns: null }],
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleNext = async () => {
    // Validate the form for the current step
    let isStepValid = false;

    if (activeStep === 0) {
      // Validate fields for Step 1
      isStepValid = await methods.trigger(['firstName', 'lastName', 'email']);
    } else if (activeStep === 1) {
      // Validate fields for Step 2
      isStepValid = await methods.trigger(['materials']);
    }
    if (!isStepValid) {
      console.error('Validation failed:', methods.formState.errors);
      return; // Prevent moving to the next step
    }
    console.log(isStepValid);
    if (isStepValid) {
      if (activeStep === 0) {
        // Trigger API call on the first step
        try {
          const userDetails = methods.getValues();
          console.log(userDetails);
          // const response = await fetch('/api/saveUserDetails', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({
          //     firstName: userDetails.firstName,
          //     lastName: userDetails.lastName,
          //     email: userDetails.email,
          //     password: userDetails.password,
          //   }),
          // });
          // const data = await response.json();
          setUserId(1); // Store the user ID for later use
        } catch (error) {
          console.error('Error saving user details:', error);
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
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="firstName" label="First name" />
        <RHFTextField name="lastName" label="Last name" />
      </Stack>

      <RHFTextField name="email" label="Email address" />
    </Stack>
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
              name={`materials[${index}].quantityInNos`}
              label="Quantity (Nos)"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <RHFTextField
              type="number"
              name={`materials[${index}].quantityInKg`}
              label="Quantity (Kg)"
            />
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
