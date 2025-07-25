import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import FormProvider, { RHFTextField, RHFUploadAvatar, RHFSelect, RHFAutocomplete } from 'src/components/hook-form';
import { Chip, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { states } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import { useGetProcessess } from 'src/api/processes';
import { useGetHsnMasters } from 'src/api/hsnMaster';
import { useAuthContext } from 'src/auth/hooks';
import { TimePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

export default function ItemsMasterViewForm({ currentItem }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();
  const [processOptions, setProcessOptions] = useState([]);
  const [hsnMasterOptions, setHsnMasterOptions] = useState([]);
  const { processess } = useGetProcessess();
  const { hsnMasters } = useGetHsnMasters();
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  useEffect(() => {
    if (processess && processess.length > 0) {
      setProcessOptions(processess);
    }
  }, [processess]);

  useEffect(() => {
    if (hsnMasters && hsnMasters.length > 0) {
      setHsnMasterOptions(hsnMasters);
    }
  }, [hsnMasters]);

  const NewItemsMasterSchema = Yup.object().shape({
    materialType: Yup.string().required('Material type is required'),
    hsnMaster: Yup.object().nullable().required('HSN Code is required'),
    preTreatmentProcesses: Yup.array().of(Yup.object()).min(1, "Select one process atleast"),
    galvanizingProcesses: Yup.array().of(Yup.object()).min(1, "Select one process atleast"),
    itemProcessDuration: Yup.array().of(Yup.object().shape({
      processId: Yup.number().required('Process Id is required'),
      processName: Yup.string().required('Process name is required'),
      processDuration: Yup.string().required('Process duration is required'),
    })),
    status: Yup.boolean(),
  });
  const defaultValues = useMemo(
    () => ({
      materialType: currentItem?.materialType || '',
      hsnMaster: null,
      preTreatmentProcesses: [],
      galvanizingProcesses: [],
      itemProcessDuration: currentItem?.itemProcessDuration?.length > 0 ? currentItem?.itemProcessDuration?.map((item) => ({
        processId: item.processesId,
        processName: item.processName,
        processDuration: new Date(item.processDuration)
      })) : [],
      status: currentItem?.status || 1,
    }),
    [currentItem]
  );

  const methods = useForm({
    resolver: yupResolver(NewItemsMasterSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);

      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive,
        dob: formData.dob,
        fullAddress: formData.address,
        city: formData.city,
        state: formData.state,
        employeeId: formData.employeeId,
      };
      if (formData.avatarUrl) {
        inputData.avatar = {
          fileUrl: formData.avatarUrl,
        };
      }
      if (formData.password) {
        inputData.password = formData.password;
      }
      if (!currentItem) {
        await axiosInstance.post('/register', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/api/hsnMasters/${currentItem.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentItem ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.hsnMaster.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentItem) {
      reset(defaultValues);
      setValue('hsnMaster', currentItem?.hsnMaster ? currentItem?.hsnMaster : null);
      if (currentItem?.processes && currentItem?.processes?.length > 0) {
        const preTreatmentProcesses = currentItem?.processes?.filter((p) => p.processGroup === 0);
        const galvanizingProcesses = currentItem?.processes?.filter((p) => p.processGroup === 1);

        setValue('preTreatmentProcesses', preTreatmentProcesses);
        setValue('galvanizingProcesses', galvanizingProcesses);
      } else {
        setValue('preTreatmentProcesses', []);
        setValue('galvanizingProcesses', []);
      }
    }
  }, [currentItem, defaultValues, reset, setValue]);

  useEffect(() => {
    const pretreatment = values.preTreatmentProcesses || [];
    const galvanizing = values.galvanizingProcesses || [];

    const allSelectedProcesses = [...pretreatment, ...galvanizing];

    const existingDurations = getValues('itemProcessDuration') || [];

    const updatedDurations = allSelectedProcesses.map((process) => {
      const existing = existingDurations.find((e) => e.processId === process.id);
      return {
        processId: process.id,
        processName: process.name,
        processDuration: existing?.processDuration || '',
      };
    });

    setValue('itemProcessDuration', updatedDurations, { shouldValidate: true });
  }, [values.galvanizingProcesses, values.preTreatmentProcesses, getValues, setValue]);

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
              <RHFTextField disabled name="materialType" label="Material Type" />

              <RHFAutocomplete
                name='hsnMaster'
                label="HSN Master"
                options={hsnMasterOptions || []}
                getOptionLabel={(option) => `${option?.hsnCode}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    option.hsnCode.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${option?.hsnCode}`}
                      </Typography>
                    </div>
                  </li>
                )}
                renderTags={(value, props) => (
                  <Chip
                    value={value}
                    disabled={!isAdmin}
                  />
                )}
                disabled
              />

              <RHFAutocomplete
                multiple
                name='preTreatmentProcesses'
                label="Pre Treatment Processes"
                options={processOptions || []}
                getOptionLabel={(option) => `${option?.name}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    (option.name.toLowerCase().includes(inputValue.toLowerCase()) && option.processGroup === 0)
                  )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${option?.name}`}
                      </Typography>
                    </div>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      disabled
                    />
                  ))
                }
                disabled
              />

              <RHFAutocomplete
                multiple
                name='galvanizingProcesses'
                label="Galvanizing Processes"
                options={processOptions || []}
                getOptionLabel={(option) => `${option?.name}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    (option.name.toLowerCase().includes(inputValue.toLowerCase()) && option.processGroup === 1)
                  )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${option?.name}`}
                      </Typography>
                    </div>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      disabled
                    />
                  ))
                }
                disabled
              />
            </Box>

            {values.itemProcessDuration && values.itemProcessDuration?.length > 0 && values.itemProcessDuration?.map((item, index) => (
              <Box
                key={item.processId}
                rowGap={2}
                columnGap={2}
                display="grid"
                sx={{ my: 3 }}
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(3, 1fr)',
                }}
              >
                <RHFTextField disabled name={`itemProcessDuration[${index}].processId`} label='Process Id' />
                <RHFTextField disabled name={`itemProcessDuration[${index}].processName`} label='Process Name' />
                <Controller
                  name={`itemProcessDuration[${index}].processDuration`}
                  control={control}
                  render={({ field, fieldState }) => {
                    console.log('fieldState', fieldState.error);
                    return (
                      <TimePicker
                        {...field}
                        label="Process Duration"
                        ampm={false}
                        disabled
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
                        sx={{ minWidth: '140px' }}
                      />
                    )
                  }}
                />
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ItemsMasterViewForm.propTypes = {
  currentItem: PropTypes.object,
};
