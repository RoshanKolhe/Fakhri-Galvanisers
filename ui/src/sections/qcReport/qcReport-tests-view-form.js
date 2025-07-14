/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-plusplus */
import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Grid, Stack, MenuItem, Button, TextField, Chip, Autocomplete } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';
import axiosInstance from 'src/utils/axios';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';

export default function QcReportTestsViewForm({ currentQcReport }) {
  const NewQuotationSchema = Yup.object().shape({
    qcTests: Yup.array()
      .of(
        Yup.object().shape({
          specification: Yup.string().required('Specification is required'),
          testDetails: Yup.string().required('Test Details is  required'),
          requirement: Yup.string().required('Requirement is required'),
          testResult: Yup.string().required('Test Result is required'),
          observed: Yup.string().required('Observed is required'),
          micronTestValues: Yup.array().of(Yup.number()).min(5, 'Five micron test values required').max(5, 'Five micron test values required')
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
          micronTestValues: qcTest?.micronTestValues || []
        }))
        : [
          {
            specification: '',
            testDetails: '',
            requirement: '',
            testResult: '',
            observed: '',
            micronTestValues: []
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

  useEffect(() => {
    if (currentQcReport) {
      reset(defaultValues);
    }
  }, [currentQcReport, defaultValues, reset]);

  return (
    <FormProvider methods={methods}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          {fields.map((item, index) => (
            <Grid container key={item.id} spacing={2} mt={1} alignItems="center">
              <Grid item xs={12} md={4}>
                <RHFTextField
                  name={`qcTests[${index}].specification`}
                  label="Specification"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField
                  name={`qcTests[${index}].testDetails`}
                  label="Test Details"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name={`qcTests[${index}].requirement`} label="Requirement" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name={`qcTests[${index}].testResult`} label="Test Result" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFSelect name={`qcTests[${index}].observed`} label="Observed" disabled>
                  <MenuItem key="satisfactory" value="satisfactory">
                    Satisfactory
                  </MenuItem>
                  <MenuItem key="unsatisfactory" value="unsatisfactory">
                    Unsatisfactory
                  </MenuItem>
                </RHFSelect>
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name={`qcTests[${index}].micronTestValues`}
                  control={control}
                  defaultValue={[]}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Autocomplete
                      disabled
                      multiple
                      freeSolo
                      options={[]}
                      value={value || []}
                      onChange={(event, newValue) => {
                        // Only allow numeric values
                        const numericValues = newValue.filter(val => !Number.isNaN(val));
                        onChange(numericValues);
                      }}
                      // eslint-disable-next-line no-shadow
                      renderTags={(value, getTagProps) =>
                        // eslint-disable-next-line no-shadow
                        value.map((option, index) => (
                          <Chip key={index} label={option} {...getTagProps({ index })} />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Micron Test Values"
                          error={!!error}
                          helperText={error ? error.message : ''}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </FormProvider>
  );
}

QcReportTestsViewForm.propTypes = {
  currentQcReport: PropTypes.arrayOf(PropTypes.object).isRequired,
};
