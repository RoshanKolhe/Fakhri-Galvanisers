import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stack,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosInstance from 'src/utils/axios';
import FormProvider, { RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import { LoadingButton } from '@mui/lab';

const OrderQcDetailsModal = ({ currentQcReport, open, onClose, onSubmitForm }) => {
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
          images: Yup.array().min(1, 'Images is required'),
        })
      )
      .min(1, 'At least one Qc Tests is required'),
  });

  const defaultValues = useMemo(
    () => ({
      qcTests: currentQcReport?.length
        ? currentQcReport.map((qcTest) => ({
            specification: qcTest.specification || '',
            testDetails: qcTest.testDetails || '',
            requirement: qcTest.requirement || '',
            testResult: qcTest.testResult || '',
            observed: qcTest?.observed || '',
            images: qcTest?.images || [],
          }))
        : [
            {
              specification: '',
              testDetails: '',
              requirement: '',
              testResult: '',
              observed: '',
              images: [],
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
      onSubmitForm(formData);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles, index) => {
      if (!acceptedFiles.length) return;

      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files[]', file); // Make sure your backend supports array
      });

      try {
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        const newFiles = data.files.map((res) => res.fileUrl);

        const currentImages = getValues(`qcTests[${index}].images`) || [];

        setValue(`qcTests[${index}].images`, [...currentImages, ...newFiles], {
          shouldValidate: true,
        });
      } catch (err) {
        console.error('Error uploading files:', err);
      }
    },
    [getValues, setValue]
  );

  const handleRemoveFile = useCallback(
    (index, fileToRemove) => {
      const currentImages = getValues(`qcTests[${index}].images`) || [];
      const updatedImages = currentImages.filter((file) => file !== fileToRemove);
      setValue(`qcTests[${index}].images`, updatedImages);
    },
    [getValues, setValue]
  );

  const handleRemoveAllFiles = useCallback(
    (index) => {
      setValue(`qcTests[${index}].images`, []);
    },
    [setValue]
  );

  useEffect(() => {
    if (currentQcReport) {
      reset(defaultValues);
    }
  }, [currentQcReport, defaultValues, reset]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Enter QC Details</DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              {fields.map((item, index) => (
                <Grid container key={item.id} spacing={2} mt={1} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <RHFTextField
                      name={`qcTests[${index}].specification`}
                      label="Specification"
                      disabled={!isAdmin}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <RHFTextField
                      name={`qcTests[${index}].testDetails`}
                      label="Test Details"
                      disabled={!isAdmin}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <RHFTextField
                      name={`qcTests[${index}].requirement`}
                      label="Requirement"
                      disabled={!isAdmin}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <RHFTextField
                      name={`qcTests[${index}].testResult`}
                      label="Test Result"
                      disabled={!isAdmin}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <RHFSelect
                      name={`qcTests[${index}].observed`}
                      label="Observed"
                      disabled={!isAdmin}
                    >
                      <MenuItem key="satisfactory" value="satisfactory">
                        Satisfactory
                      </MenuItem>
                      <MenuItem key="unsatisfactory" value="unsatisfactory">
                        Unsatisfactory
                      </MenuItem>
                    </RHFSelect>
                  </Grid>
                  <Grid item xs={12}>
                    <RHFUpload
                      multiple
                      thumbnail
                      name={`qcTests[${index}].images`}
                      maxSize={3145728}
                      accept={{
                        'image/*': [],
                        'video/*': [],
                        'application/pdf': [],
                        'application/msword': [],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                          [],
                        'application/vnd.ms-excel': [],
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
                        'application/zip': [],
                        'application/x-rar-compressed': [],
                        'text/plain': [],
                      }}
                      onDrop={(files) => handleDrop(files, index)}
                      onRemove={(file) => handleRemoveFile(index, file)}
                      onRemoveAll={() => handleRemoveAllFiles(index)}
                      sx={{ mb: 3 }}
                      disabled={!isAdmin}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {isAdmin && (
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Submit
            </LoadingButton>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default OrderQcDetailsModal;

OrderQcDetailsModal.propTypes = {
  currentQcReport: PropTypes.array,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitForm: PropTypes.func,
};
