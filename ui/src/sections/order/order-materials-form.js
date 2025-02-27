/* eslint-disable react/prop-types */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuthContext } from 'src/auth/hooks';
import { formatRFQId, MATERIAL_STATUS_OPTIONS } from 'src/utils/constants';
import { Button, Chip, Divider, MenuItem, Stack, Typography } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGetProcessess } from 'src/api/processes';
import OrderLotProcessModal from './order-lot-process-modal';

// ----------------------------------------------------------------------

const SortableItem = ({ value, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: value.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, margin: '3px' }} {...attributes} {...listeners}>
      <Chip
        key={value?.id}
        label={value?.name}
        onDelete={onDelete}
        size="small"
        color="info"
        variant="soft"
      />
    </div>
  );
};

const SortableChips = ({ value, index, props, setValue }) => {
  console.log(value, props);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 20 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    // Get existing processes
    const processes = [...value];

    const oldIndex = processes.findIndex((p) => p.id === active.id);
    const newIndex = processes.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(processes, oldIndex, newIndex);

    setValue(`materials[${index}].processes`, reordered);
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={value} strategy={verticalListSortingStrategy}>
        {value.map((item, index1) => {
          const { key, onDelete } = props({ index: index1 });
          return <SortableItem key={item.name} value={item} onDelete={onDelete} />;
        })}
      </SortableContext>
    </DndContext>
  );
};

export default function OrderMaterialForm({ currentOrder }) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [userOptions, setUserOptions] = useState([]);
  const [processOptions, setProcessOptions] = useState([]);
  const [jobCardLots, setJobCardLots] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData(null); // Clear modal data on close
  };

  const handleJobCardClick = (material) => {
    setModalData({
      processes: material.processes,
      noOfLots: material.noOfLots,
      totalQuantity: material.totalQuantity,
      materialName: material.materialType,
      materialId: material.id,
      orderId: currentOrder.orderId,
      microns: material.microns,
      customer: currentOrder.customer,
    });
    setModalOpen(true); // Open the modal
  };

  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  const NewOrderMaterialSchema = Yup.object().shape({
    firstname: Yup.string(),
    lastName: Yup.string(),
    rfqRef: Yup.string(),
    company: Yup.string(),
    materials: Yup.array().of(
      Yup.object().shape({
        materialType: Yup.string().required('Material type is required'),
        totalQuantity: Yup.number().required('Quantity is  required'),
        startDate: Yup.string()
          .required('Start Date is required')
          .test('valid-start', 'Start Date cannot be after End Date', (value, context) => {
            const { endDate } = context.parent;
            return !endDate || new Date(value) <= new Date(endDate);
          }),

        endDate: Yup.string()
          .required('End Date is required')
          .test('valid-end', 'End Date cannot be before Start Date', (value, context) => {
            const { startDate } = context.parent;
            return !startDate || new Date(value) >= new Date(startDate);
          }),
        microns: Yup.number().required('Microns is required'),
        status: Yup.number().required('Status is required'),
        noOfLots: Yup.number()
          .required('No Of Lots is required')
          .min(1, 'Value must be greater than 0'),
        remark: Yup.string(),
        users: Yup.array().min(1, 'Must have at least 1 Worker'),
        processes: Yup.array().min(1, 'Must have at least 1 Process'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentOrder ? currentOrder?.customer?.firstName : '',
      lastName: currentOrder ? currentOrder?.customer?.lastName : '',
      rfqRef: currentOrder ? formatRFQId(currentOrder?.challan?.quotationId) : '',
      company: currentOrder ? currentOrder?.customer?.company : !isAdmin ? user?.company : '',
      materials: currentOrder?.materials?.length
        ? currentOrder.materials.map((material) => ({
            id: material.id || '',
            materialType: material.materialType || '',
            microns: material.microns || 0,
            totalQuantity: material.totalQuantity || null,
            startDate: material.startDate ? new Date(material.startDate) : '',
            endDate: material.endDate ? new Date(material.endDate) : '',
            remark: material.remark || '',
            status: material.status !== undefined && material.status !== null ? material.status : 0,
            noOfLots: material.noOfLots || 0,
            users: material.users || [],
            processes: material.processes || processOptions,
          }))
        : [],
    }),
    [currentOrder, isAdmin, processOptions, user?.company]
  );

  const methods = useForm({
    resolver: yupResolver(NewOrderMaterialSchema),
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
    name: 'materials',
  });
  const values = watch();
  console.log(values);
  const { processess, processessLoading, processessEmpty, refreshProcessess } = useGetProcessess();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const updatedMaterials = formData.materials.map((material) => {
        const jobCardMaterial = jobCardLots.find((lot) => lot.materialId === material.id);
        if (jobCardMaterial) {
          return {
            ...material,
            lots: [...(material.lots || []), ...jobCardMaterial.lots],
          };
        }
        return material;
      });
      console.info('DATA', updatedMaterials);
      const inputData = {
        materialsData: updatedMaterials,
      };
      const { data } = await axiosInstance.patch(`/orders/${currentOrder.id}`, inputData);
      console.log(data);
      enqueueSnackbar('Order Details Updated Successfully');
      router.push(paths.dashboard.order.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const fetchUsers = async (event) => {
    try {
      if (event && event?.target?.value && event.target.value.length >= 3) {
        const filter = {
          where: {
            or: [
              { email: { like: `%${event.target.value}%` } },
              { firstName: { like: `%${event.target.value}%` } },
              { lastName: { like: `%${event.target.value}%` } },
              { phoneNumber: { like: `%${event.target.value}%` } },
            ],
          },
        };
        const filterString = encodeURIComponent(JSON.stringify(filter));
        const { data } = await axiosInstance.get(`/api/users/list?filter=${filterString}`);
        setUserOptions(data);
      } else {
        setUserOptions([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // const fetchProcesses = async (event) => {
  //   try {
  //     if (event && event?.target?.value && event.target.value.length >= 3) {
  //       const filter = {
  //         where: {
  //           or: [{ name: { like: `%${event.target.value}%` } }],
  //         },
  //       };
  //       const filterString = encodeURIComponent(JSON.stringify(filter));
  //       const { data } = await axiosInstance.get(`/processes?filter=${filterString}`);
  //       setProcessOptions(data);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const renderMaterialDetailsForm = (
    <Stack spacing={3} mt={2}>
      {fields.map((item, index) => (
        <Stack key={item.id} spacing={1.5} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <RHFTextField
                name={`materials[${index}].id`}
                label="id"
                disabled
                sx={{ display: 'none' }}
              />
              <RHFTextField
                name={`materials[${index}].materialType`}
                label="Material Type"
                disabled
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <RHFTextField
                type="number"
                name={`materials[${index}].totalQuantity`}
                label="Quantity"
                onChange={(e) => {
                  setValue(`materials[${index}].totalQuantity`, e.target.value);
                }}
                disabled
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <RHFTextField
                name={`materials[${index}].microns`}
                label="Microns"
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name={`materials[${index}].startDate`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Start Date"
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                    disabled={!isAdmin}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name={`materials[${index}].endDate`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="End Date"
                    value={new Date(field.value)}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                    disabled={!isAdmin}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name={`materials[${index}].status`} label="Material Status" disabled>
                {MATERIAL_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={0} sx={{ position: 'relative' }}>
                <RHFTextField
                  type="number"
                  name={`materials[${index}].noOfLots`}
                  label="No Of Lots"
                  fullWidth
                  disabled={item.status !== 0 || !isAdmin}
                />

                {/** Job Card Button outside the TextField */}
                {isAdmin ? (
                  <Button
                    variant="text"
                    sx={{
                      textTransform: 'none',
                      alignSelf: 'flex-end',
                      color: '#0000FF',
                      fontWeight: 400,
                    }}
                    onClick={() => {
                      if (values.materials[index].noOfLots <= 0) {
                        enqueueSnackbar('No of Lots should be greater than 0', {
                          variant: 'error',
                        });
                        return;
                      }
                      if (values.materials[index].processes.length <= 0) {
                        enqueueSnackbar('Please Select at least one process', {
                          variant: 'error',
                        });
                        return;
                      }
                      handleJobCardClick(values.materials[index]);
                    }}
                  >
                    Job Card
                  </Button>
                ) : null}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutocomplete
                multiple
                name={`materials[${index}].users`}
                label="Assign Workers"
                onInputChange={(event) => fetchUsers(event)}
                options={userOptions || []}
                getOptionLabel={(option) => `${option?.firstName} ${option?.lastName}` || ''}
                filterOptions={(x) => x}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${option?.firstName} ${option?.lastName}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {option.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {option.phoneNumber}
                      </Typography>
                    </div>
                  </li>
                )}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, tagIndex) => (
                    <Chip
                      {...getTagProps({ index: tagIndex })}
                      key={option.id}
                      label={`${option.firstName} ${option.lastName}`}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
                disabled={!isAdmin}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutocomplete
                multiple
                name={`materials[${index}].processes`}
                label="Processes"
                options={processOptions || []}
                getOptionLabel={(option) => `${option?.name}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${option?.name}`}
                      </Typography>
                    </div>
                  </li>
                )}
                renderTags={(value, props) => (
                  <SortableChips index={index} value={value} props={props} setValue={setValue} />
                )}
                disabled={item.status !== 0 || !isAdmin}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField
                name={`materials[${index}].remark`}
                multiline
                rows={3}
                label="Remark"
                disabled={!isAdmin}
              />
            </Grid>
          </Grid>
          {index < fields.length - 1 && <Divider sx={{ my: 2, borderStyle: 'dashed' }} />}
        </Stack>
      ))}
    </Stack>
  );

  useEffect(() => {
    if (currentOrder) {
      reset(defaultValues);
    }
  }, [currentOrder, defaultValues, reset]);

  useEffect(() => {
    if (currentOrder) {
      const transformedOrder = currentOrder.materials.map((material) => ({
        materialId: material.id,
        lots:
          material.lots?.map((lot) => ({
            lotNumber: lot.lotNumber,
            quantity: lot.quantity,
            status: lot.status,
            processes: lot.processes.map((process) => ({
              processId: process.id,
              duration: process.processesDetails.duration,
              status: process.processesDetails.status,
              timeTaken: process.processesDetails?.timeTaken,
            })),
          })) || [],
      }));
      console.log(transformedOrder);
      setJobCardLots(transformedOrder);
    }
  }, [currentOrder]);

  useEffect(() => {
    if (processess) {
      setProcessOptions(processess);
    }
  }, [processess]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="firstName" label="Customer First Name" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="lastName" label="Customer Last Name" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="company" label="Company" disabled />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="rfqRef" label="RFQ Reference" disabled />
              </Grid>
              <Grid item xs={12}>
                {renderMaterialDetailsForm}
              </Grid>
              {isAdmin ? (
                <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Save
                  </LoadingButton>
                </Stack>
              ) : null}
            </Grid>
          </Card>
        </Grid>
      </Grid>
      {modalOpen && (
        <OrderLotProcessModal
          open={modalOpen}
          onClose={handleCloseModal}
          processes={modalData?.processes}
          noOfLots={modalData?.noOfLots}
          totalQuantity={modalData?.totalQuantity}
          materialName={modalData?.materialName}
          orderId={modalData?.orderId}
          materialId={modalData?.materialId}
          microns={modalData?.microns}
          customer={modalData?.customer}
          jobCardLots={jobCardLots}
          setJobCardLots={setJobCardLots}
        />
      )}
    </FormProvider>
  );
}

OrderMaterialForm.propTypes = {
  currentOrder: PropTypes.object,
};
