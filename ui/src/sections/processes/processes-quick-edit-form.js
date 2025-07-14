import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { COMMON_STATUS_OPTIONS, states } from 'src/utils/constants';
import axiosInstance from 'src/utils/axios';
import { TextField } from '@mui/material';
// import { TimePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

export default function ProcessesQuickEditForm({
  currentProcesses,
  open,
  onClose,
  refreshProcessess,
}) {
  console.log(currentProcesses);
  const { enqueueSnackbar } = useSnackbar();
  const processGroupOptions = [
    { label: 'Pre Treatment', value: 0 },
    { label: 'Galvanizing', value: 1 }
  ];

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
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData);
    try {
      const inputData = {
        name: formData.name,
        processGroup: formData.processGroup,
        description: formData.description,
        // duration: formData.duration,
        status: formData.status ? 1 : 0,
      };
      await axiosInstance.patch(`/processes/${currentProcesses.id}`, inputData);
      refreshProcessess();
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', formData);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          {/* {!currentProcesses?.status && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Hsn is In-Active
            </Alert>
          )} */}

          <Box
            mt={2}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label="Status">
              {COMMON_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
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
                    sx={{ minWidth: '140px', marginTop: 2 }}
                  />
                )
              }}
            /> */}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

ProcessesQuickEditForm.propTypes = {
  currentProcesses: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshProcessess: PropTypes.func,
};
