/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-plusplus */
import { useCallback, useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { Grid, Stack, MenuItem, Button, TextField, Chip, Autocomplete } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
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
          micronTestValues: Yup.array().of(Yup.number()).min(5, 'Five micron test values required').max(5, 'Five micron test values required')
        })
      )
      .min(1, 'At least one Qc Tests is required'),
    images: Yup.array().min(1, 'Images is required'),
  });

  const defaultValues = useMemo(
    () => ({
      images: currentQcReport?.images || [],
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
    getValues,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'qcTests',
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);
      const inputData = { qcTests: formData.qcTests, images: formData.images };
      console.log(inputData);
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

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      console.log(acceptedFiles);
      if (!acceptedFiles.length) return;
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files[]', file); // Ensure backend supports array uploads
      });
      try {
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        console.log(data);
        const newFiles = data.files.map((res) => res.fileUrl);

        // Get the current images from the form
        const currentImages = getValues('images') || [];

        // Merge new images with existing ones
        setValue('images', [...currentImages, ...newFiles], {
          shouldValidate: true,
        });
      } catch (err) {
        console.error('Error uploading files:', err);
      }
    },
    [getValues, setValue]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

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
              <Grid item xs={12} md={4}>
                <RHFTextField name={`qcTests[${index}].specification`} label="Specification" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name={`qcTests[${index}].testDetails`} label="Test Details" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name={`qcTests[${index}].requirement`} label="Requirement" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name={`qcTests[${index}].testResult`} label="Test Result" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFSelect name={`qcTests[${index}].observed`} label="Observed">
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
        </Grid>

        <Grid item xs={12}>
          <RHFUpload
            multiple
            thumbnail
            name="images"
            maxSize={3145728}
            accept={{
              'image/*': [],
              'video/*': [],
              'application/pdf': [],
              'application/msword': [],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
              'application/vnd.ms-excel': [],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
              'application/zip': [],
              'application/x-rar-compressed': [],
              'text/plain': [],
            }}
            onDrop={handleDrop}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            sx={{ mb: 3 }}
          />
        </Grid>

        <Stack alignItems="flex-start" sx={{ mt: 3 }}>
          {isAdmin && (
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Submit QC Tests
            </LoadingButton>
          )}
        </Stack>
      </Grid>
    </FormProvider>
  );
}

QcReportTestsEditForm.propTypes = {
  currentQcReport: PropTypes.arrayOf(PropTypes.object).isRequired,
};
