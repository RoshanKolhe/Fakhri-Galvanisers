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

export default function HsnMasterViewForm({ currentHsnMaster }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const password = useBoolean();

  const NewHsnMasterSchema = Yup.object().shape({
    hsnCode: Yup.string().required('Hsn Code is required'),
    tax: Yup.number().required('Tax is required'),
    status: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      hsnCode: currentHsnMaster?.hsnCode || '',
      tax: currentHsnMaster?.tax || '',
      status: currentHsnMaster?.status ? 1 : 0,
    }),
    [currentHsnMaster]
  );

  const methods = useForm({
    resolver: yupResolver(NewHsnMasterSchema),
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
      if (!currentHsnMaster) {
        await axiosInstance.post('/register', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/api/hsnMasters/${currentHsnMaster.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentHsnMaster ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.hsnMaster.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentHsnMaster) {
      reset(defaultValues);
    }
  }, [currentHsnMaster, defaultValues, reset]);

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
              <RHFTextField name="hsnCode" label="Hsn Code" disabled />
              <RHFTextField type="number" name="tax" label="Tax(%)" disabled/>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

HsnMasterViewForm.propTypes = {
  currentHsnMaster: PropTypes.object,
};
