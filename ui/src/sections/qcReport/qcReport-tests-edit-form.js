/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-plusplus */
import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Grid, Stack, MenuItem, Button } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import axiosInstance from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';

export default function QcReportTestsEditForm({ currentQcReport }) {
  console.log(currentQcReport);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;
  const NewQuotationSchema = Yup.object().shape({
    qcTests: Yup.array()
      .of(
        Yup.object().shape({
          specification: Yup.string().required('Specification is required'),
          testDetails: Yup.string().required('Test Details is  required'),
          requirement: Yup.string().required('Requirement is required'),
          testResult: Yup.string().required('Test Result is required'),
          observed: Yup.string().required('Observed is required'),
        })
      )
      .min(1, 'At least one Qc Tests is required'),
  });

  const defaultValues = useMemo(
    () => ({
      qcTests: currentQcReport?.qcTests?.length
        ? currentQcReport.qcTests.map((qcTest) => ({
            specification: qcTest.specification || '',
            testDetails: qcTest.testDetails || '',
            requirement: qcTest.requirement || '',
            testResult: qcTest.testResult || '',
            observed: qcTest?.observed || '',
          }))
        : [
            {
              specification: '',
              testDetails: '',
              requirement: '',
              testResult: '',
              observed: '',
            },
          ],
    }),
    [currentQcReport]
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
    name: 'qcTests',
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);
      const inputData = formData.qcTests;
      await axiosInstance.post(`/qc-reports/${currentQcReport.id}/create-tests`, inputData);
      reset();
      enqueueSnackbar('Qc Tests Added Successfully');
      router.push(paths.dashboard.qcReport.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentQcReport) {
      reset(defaultValues);
    }
  }, [currentQcReport, defaultValues, reset]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          {fields.map((item, index) => (
            <Grid container key={item.id} spacing={2} mt={1} alignItems="center">
              <Grid item xs={12} md={2}>
                <RHFTextField name={`qcTests[${index}].specification`} label="Specification" />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFTextField name={`qcTests[${index}].testDetails`} label="Test Details" />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFTextField name={`qcTests[${index}].requirement`} label="Requirement" />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFTextField name={`qcTests[${index}].testResult`} label="Test Result" />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFSelect name={`qcTests[${index}].observed`} label="Observed">
                  <MenuItem key="satisfactory" value="satisfactory">
                    Satisfactory
                  </MenuItem>
                  <MenuItem key="unsatisfactory" value="unsatisfactory">
                    Unsatisfactory
                  </MenuItem>
                </RHFSelect>
              </Grid>
              {isAdmin && (
                <Grid item xs={12} md={2}>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </Grid>
              )}
            </Grid>
          ))}
          {isAdmin && (
            <Grid item xs={12}>
              <Button
                size="small"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() =>
                  append({
                    specification: '',
                    testDetails: '',
                    requirement: '',
                    testResult: '',
                    observed: '',
                  })
                }
              >
                Add Item
              </Button>
            </Grid>
          )}
          <Stack alignItems="flex-start" sx={{ mt: 3 }}>
            {isAdmin && (
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Submit QC Tests
              </LoadingButton>
            )}
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

QcReportTestsEditForm.propTypes = {
  currentQcReport: PropTypes.arrayOf(PropTypes.object).isRequired,
};
