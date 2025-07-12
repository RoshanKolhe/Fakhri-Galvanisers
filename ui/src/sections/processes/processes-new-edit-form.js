import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { MenuItem, TextField } from '@mui/material';

// ----------------------------------------------------------------------

export default function ProcessesNewEditForm({ currentProcesses }) {
  const router = useRouter();
  const processGroupOptions = [
    { label: 'Pre Treatment', value: 0 },
    { label: 'Galvanizing', value: 1 }
  ];

  const { enqueueSnackbar } = useSnackbar();

  const NewProcessesSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    // duration: Yup.string().required('Duration is required'),
    processGroup: Yup.number().required('Process group is required'),
    description: Yup.string(),
    status: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentProcesses?.name || '',
      // duration: currentProcesses?.duration ? new Date(currentProcesses?.duration) : null,
      processGroup: currentProcesses?.processGroup || 0,
      description: currentProcesses?.description || '',
      status: currentProcesses?.status || 1,
    }),
    [currentProcesses]
  );

  const methods = useForm({
    resolver: yupResolver(NewProcessesSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);

      const inputData = {
        name: formData.name,
        processGroup: formData.processGroup,
        description: formData.description,
        // duration: formData.duration,
        status: formData.status ? 1 : 0,
      };
      if (!currentProcesses) {
        await axiosInstance.post('/processes', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/processes/${currentProcesses.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentProcesses ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.processes.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentProcesses) {
      reset(defaultValues);
    }
  }, [currentProcesses, defaultValues, reset]);

  console.log('errors', errors);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
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
              <RHFTextField name="name" label="Name" />
              <RHFSelect name="processGroup" label="Select Process Group">
                {processGroupOptions.length > 0 ? processGroupOptions.map((group) => (
                  <MenuItem value={group.value}>{group.label}</MenuItem>
                )) : (
                  <MenuItem value=''>No Group</MenuItem>
                )}
              </RHFSelect>
              <RHFTextField name="description" label="Description" />
              {/* <Controller
                name="duration"
                control={control}
                render={({ field, fieldState }) => {
                  console.log('fieldState', fieldState.error);
                  return (
                    <TimePicker
                      {...field}
                      label="Duration"
                      ampm={false}
                      views={['minutes', 'seconds']}
                      format="mm:ss"
                      value={field.value || null}
                      onChange={(value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                        },
                      }}
                      sx={{ minWidth: '140px'}}
                    />
                  )
                }}
              /> */}
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentProcesses ? 'Create Processes' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProcessesNewEditForm.propTypes = {
  currentProcesses: PropTypes.object,
};
