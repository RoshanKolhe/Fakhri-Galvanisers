import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';
// @mui
import { useSnackbar } from 'src/components/snackbar';
import Dialog from '@mui/material/Dialog';

//
import { useAuthContext } from 'src/auth/hooks';
import { useForm } from 'react-hook-form';
import { DialogContent, DialogTitle } from '@mui/material';
import FormProvider, { RHFUpload } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { yupResolver } from '@hookform/resolvers/yup';

// ----------------------------------------------------------------------

export default function InvoicePaymentProofModal({ open, handleClose, invoice, refreshPayment }) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;
  const NewImagesSchema = Yup.object().shape({
    images: Yup.array().min(1, 'Images is required'),
  });
  const defaultValues = useMemo(
    () => ({
      images: invoice?.paymentProof || [],
    }),
    [invoice]
  );
  const methods = useForm({
    resolver: yupResolver(NewImagesSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleUplaodPaymentProof = handleSubmit(async (data) => {
    try {
      const inputData = {
        paymentProof: data.images,
        status: 3,
      };
      await axiosInstance.patch(`/payments/${invoice.id}`, inputData);
      enqueueSnackbar('Payment Proof uploaded successfully');
      refreshPayment();
      handleClose();
    } catch (err) {
      console.error(err);
      enqueueSnackbar(typeof error === 'string' ? err : err.error.message, {
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
    if (invoice) {
      reset(defaultValues);
    }
  }, [invoice, defaultValues, reset]);
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Paymet Proof</DialogTitle>
      <FormProvider methods={methods} onSubmit={handleUplaodPaymentProof}>
        <DialogContent>
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
            onUpload={() => handleUplaodPaymentProof()}
            sx={{ mb: 3 }}
            disabled={invoice?.status === 1}
          />
        </DialogContent>
      </FormProvider>
    </Dialog>
  );
}

InvoicePaymentProofModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  invoice: PropTypes.object,
  refreshPayment: PropTypes.func,
};
