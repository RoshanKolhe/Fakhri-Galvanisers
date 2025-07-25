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

// ----------------------------------------------------------------------

export default function ItemsMasterQuickEditForm({
  currentItem,
  open,
  onClose,
  refreshHsnMasters,
}) {
  console.log(currentItem);
  const { enqueueSnackbar } = useSnackbar();

  const NewItemsMasterSchema = Yup.object().shape({
      materialType: Yup.string().required('Material type is required'),
      hsnMaster: Yup.object().nullable().required('HSN Code is required'),
      processes: Yup.array().of(Yup.object()).min(1, "Select one process atleast"),
      status: Yup.boolean(),
    });
  
    const defaultValues = useMemo(
      () => ({
        materialType: currentItem?.materialType || '',
        hsnMaster: null,
        processes: [],
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
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData);
    try {
      const inputData = {
        hsnCode: formData.hsnCode,
        tax: formData.tax,
        status: formData.status ? 1 : 0,
      };
      await axiosInstance.patch(`/hsn-masters/${currentItem.id}`, inputData);
      refreshHsnMasters();
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
          {!currentItem?.status && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Hsn is In-Active
            </Alert>
          )}

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
            <RHFTextField name="hsnCode" label="Hsn Code" />
            <RHFTextField name="tax" label="Tax" />
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

ItemsMasterQuickEditForm.propTypes = {
  currentItem: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refreshHsnMasters: PropTypes.func,
};
