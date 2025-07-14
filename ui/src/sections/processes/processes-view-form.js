import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar, RHFSelect } from 'src/components/hook-form';
import { IconButton, InputAdornment, MenuItem } from '@mui/material';
import { states } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function ProcessesViewForm({ currentProcesses }) {
  const router = useRouter();
  const processGroupOptions = [
    { label: 'Pre Treatment', value: 0 },
    { label: 'Galvanizing', value: 1 }
  ];

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

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
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    console.log('here');
  });

  useEffect(() => {
    if (currentProcesses) {
      reset(defaultValues);
    }
  }, [currentProcesses, defaultValues, reset]);

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
              <RHFTextField name="name" label="Hsn Code" disabled />
              <RHFSelect disabled name="processGroup" label="Select Process Group">
                {processGroupOptions.length > 0 ? processGroupOptions.map((group) => (
                  <MenuItem value={group.value}>{group.label}</MenuItem>
                )) : (
                  <MenuItem value=''>No Group</MenuItem>
                )}
              </RHFSelect>
              <RHFTextField name="description" label="Description" disabled />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProcessesViewForm.propTypes = {
  currentProcesses: PropTypes.object,
};
