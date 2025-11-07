import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance from 'src/utils/axios';
import InvoiceNewEditDetails from './invoice-new-edit-details';
import InvoiceNewEditAddress from './invoice-new-edit-address';
import InvoiceNewEditStatusDate from './invoice-new-edit-status-date';

// ----------------------------------------------------------------------

export default function InvoiceNewEditForm({ currentInvoice }) {
  const router = useRouter();

  const loadingSave = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSend = useBoolean();

  const NewInvoiceSchema = Yup.object().shape({
    invoiceTo: Yup.mixed().nullable().required('Invoice to is required'),
    createdAt: Yup.mixed().nullable().required('Create date is required'),
    dueDate: Yup.mixed()
      .required('Due date is required')
      .test(
        'date-min',
        'Due date must be later than create date',
        (value, { parent }) => value.getTime() > parent.createdAt.getTime()
      ),
    // not required
    status: Yup.string(),
    customer: Yup.mixed(),
    totalAmount: Yup.number(),
    performaId: Yup.string(),
    materials: Yup.array()
      .of(
        Yup.object().shape({
          materialType: Yup.string().required('Material type is required'),
          quantity: Yup.number().required('Quantity is  required'),
          billingUnit: Yup.string().required('Billing Unit is required'),
          hsnNo: Yup.object().required('Hsn is required'),
          microns: Yup.number().required('Microns is required'),
          tax: Yup.number().required('Tax is required'),
          pricePerUnit: Yup.number().required('Price is required'),
          priceAfterTax: Yup.number().required('Price After Tax is required'),
        })
      )
      .min(1, 'At least one material is required'),
  });

  const defaultValues = useMemo(
    () => ({
      performaId: currentInvoice?.performaId || '',
      createdAt: new Date(currentInvoice?.createdAt) || new Date(),
      dueDate: new Date(currentInvoice?.dueDate) || null,
      status: currentInvoice?.status || 0,
      invoiceFrom: currentInvoice?.invoiceFrom || null,
      invoiceTo: currentInvoice?.customer || null,
      materials: currentInvoice?.order?.challan?.materials?.length
        ? currentInvoice?.order?.challan?.materials.map((material) => ({
            materialType: material.materialType || '',
            quantity: material.quantity || null,
            billingUnit: material.billingUnit || '',
            hsnNo: material.hsnNo || null,
            microns: material.microns || 0,
            tax: material.tax || 0,
            pricePerUnit: material.pricePerUnit || 0,
            priceAfterTax: material.priceAfterTax || 0,
          }))
        : [],
      totalAmount: currentInvoice?.totalAmount || 0,
    }),
    [currentInvoice]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvoiceSchema),
    defaultValues,
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleCreateAndSend = handleSubmit(async (formData) => {
    loadingSend.onTrue();
    try {
      const inputData = {
        dueDate: formData.dueDate,
        status: Number(formData.status),
      };
      const { data } = await axiosInstance.patch(`/payments/${currentInvoice?.id}`, inputData);
      reset();
      loadingSend.onFalse();
      enqueueSnackbar('Update success!');
      router.push(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  useEffect(() => {
    if (currentInvoice) {
      reset(defaultValues);
    }
  }, [currentInvoice, defaultValues, reset]);

  return (
    <FormProvider methods={methods}>
      <Card>
        <InvoiceNewEditAddress />

        <InvoiceNewEditStatusDate invoice={currentInvoice} />

        <InvoiceNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          Update
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

InvoiceNewEditForm.propTypes = {
  currentInvoice: PropTypes.object,
};
