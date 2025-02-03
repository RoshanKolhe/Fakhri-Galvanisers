import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function HsnMasterNewEditForm({ currentHsnMaster }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewHsnMasterSchema = Yup.object().shape({
    hsnCode: Yup.string().required('Hsn Code is required'),
    tax: Yup.number().required('Tax is required'),
    status: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      hsnCode: currentHsnMaster?.hsnCode || '',
      tax: currentHsnMaster?.tax || '',
      status: currentHsnMaster?.status || 1,
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
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);

      const inputData = {
        hsnCode: formData.hsnCode,
        tax: formData.tax,
        status: formData.status ? 1 : 0,
      };
      if (!currentHsnMaster) {
        await axiosInstance.post('/hsn-masters', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/hsn-masters/${currentHsnMaster.id}`, inputData);
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
              <RHFTextField name="hsnCode" label="Hsn Code" />
              <RHFTextField type="number" name="tax" label="Tax(%)" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentHsnMaster ? 'Create HsnMaster' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

HsnMasterNewEditForm.propTypes = {
  currentHsnMaster: PropTypes.object,
};
