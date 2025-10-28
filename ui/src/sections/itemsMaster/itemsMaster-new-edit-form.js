import PropTypes, { object } from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { Chip, MenuItem, TextField, Typography } from '@mui/material';
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
import { useAuthContext } from 'src/auth/hooks';
import { useGetHsnMasters } from 'src/api/hsnMaster';
import { TimePicker } from '@mui/x-date-pickers';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

const SortableItem = ({ value, onDelete, disabled }) => {
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
        size="small"
        color="info"
        variant="soft"
        {...(disabled ? { onDelete: undefined } : { onDelete })} // Disable delete if `disabled`
      />
    </div>
  );
};

SortableItem.propTypes = {
  value: PropTypes.object,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool
}

const SortableChips = ({ value, props, setValue, disabled, valueName }) => {

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 20 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const processes = value;

    const oldIndex = processes.findIndex((p) => p.id === active.id);
    const newIndex = processes.findIndex((p) => p.id === over.id);

    console.log('index', oldIndex, newIndex);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(processes, oldIndex, newIndex);

    setValue(`${valueName}`, reordered);
  };

  return (
    <DndContext
      sensors={disabled ? [] : sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={value} strategy={verticalListSortingStrategy}>
        {value.map((item, index1) => {
          const { key, onDelete } = props({ index: index1 });
          return (
            <SortableItem key={item.name} value={item} onDelete={onDelete} disabled={disabled} />
          );
        })}
      </SortableContext>
    </DndContext>
  );
};

SortableChips.propTypes = {
  value: PropTypes.arrayOf(object),
  setValue: PropTypes.func,
  props: PropTypes.any,
  disabled: PropTypes.bool,
  valueName: PropTypes.string,
}

export default function ItemsMasterNewEditForm({ currentItemsMaster }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [processOptions, setProcessOptions] = useState([]);
  const [hsnMasterOptions, setHsnMasterOptions] = useState([]);
  const { processess } = useGetProcessess();
  const { hsnMasters } = useGetHsnMasters();
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  useEffect(() => {
  if (processess && processess.length > 0) {
    const activeProcesses = processess.filter((p) => p.status === 1);
    setProcessOptions(activeProcesses);
  }
}, [processess]);


useEffect(() => {
  if (hsnMasters && hsnMasters.length > 0) {
    const activeHsnMasters = hsnMasters.filter((h) => h.status === 1);
    setHsnMasterOptions(activeHsnMasters);
  }
}, [hsnMasters]);

  const NewItemsMasterSchema = Yup.object().shape({
    materialType: Yup.string().required('Material type is required'),
    hsnMaster: Yup.object().nullable().required('HSN Code is required'),
    preTreatmentProcesses: Yup.array().of(Yup.object()).min(1, "Select one process atleast"),
    galvanizingProcesses: Yup.array().of(Yup.object()).min(1, "Select one process atleast"),
    itemProcessDuration: Yup.array().of(Yup.object().shape({
      processId: Yup.number().required('Process Id is required'),
      processName: Yup.string().required('Process name is required'),
      processDuration: Yup.string().required('Process duration is required'),
    })),
    status: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      materialType: currentItemsMaster?.materialType || '',
      hsnMaster: null,
      preTreatmentProcesses: [],
      galvanizingProcesses: [],
      itemProcessDuration: currentItemsMaster?.itemProcessDuration?.length > 0 ? currentItemsMaster?.itemProcessDuration?.map((item) => ({
        processId: item.processesId,
        processName: item.processName,
        processDuration: new Date(item.processDuration)
      })) : [],
      status: currentItemsMaster?.status !== undefined ? currentItemsMaster.status : 1,
    }),
    [currentItemsMaster]
  );

  const methods = useForm({
    resolver: yupResolver(NewItemsMasterSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);

      console.log('pre treatment process', formData.preTreatmentProcesses);
      console.log('galvanizing process', formData.galvanizingProcesses);

      const processes = [
        ...(formData.preTreatmentProcesses.map((i) => i.id) || []),
        ...(formData.galvanizingProcesses.map((i) => i.id) || []),
      ];

      const inputData = {
        materialType: formData.materialType,
        hsnMasterId: formData.hsnMaster?.id,
        itemProcessDuration: formData.itemProcessDuration,
        processes,
        status: formData.status ? 1 : 0,
      };
      if (!currentItemsMaster) {
        await axiosInstance.post('/items', inputData);
      } else {
        console.log('here');
        await axiosInstance.patch(`/items/${currentItemsMaster.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentItemsMaster ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.itemsMaster.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentItemsMaster) {
      reset(defaultValues);
      setValue('hsnMaster', currentItemsMaster?.hsnMaster ? currentItemsMaster?.hsnMaster : null);
      if (currentItemsMaster?.processes && currentItemsMaster?.processes?.length > 0) {
        const preTreatmentProcesses = currentItemsMaster?.processes?.filter((p) => p.processGroup === 0);
        const galvanizingProcesses = currentItemsMaster?.processes?.filter((p) => p.processGroup === 1);

        setValue('preTreatmentProcesses', preTreatmentProcesses);
        setValue('galvanizingProcesses', galvanizingProcesses);
      } else {
        setValue('preTreatmentProcesses', []);
        setValue('galvanizingProcesses', []);
      }
    }
  }, [currentItemsMaster, defaultValues, reset, setValue]);

  useEffect(() => {
    const pretreatment = values.preTreatmentProcesses || [];
    const galvanizing = values.galvanizingProcesses || [];

    const allSelectedProcesses = [...pretreatment, ...galvanizing];

    const existingDurations = getValues('itemProcessDuration') || [];

    const updatedDurations = allSelectedProcesses.map((process) => {
      const existing = existingDurations.find((e) => e.processId === process.id);
      return {
        processId: process.id,
        processName: process.name,
        processDuration: existing?.processDuration || '',
      };
    });

    setValue('itemProcessDuration', updatedDurations, { shouldValidate: true });
  }, [values.galvanizingProcesses, values.preTreatmentProcesses, getValues, setValue]);


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
              <Stack direction="row" spacing={2}>
                {currentItemsMaster && (
                  <RHFSelect name="status" label="Status">
                    {COMMON_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={String(option.value)} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
                <RHFTextField name="materialType" label="Material Type" />
              </Stack>

              <RHFAutocomplete
                name='hsnMaster'
                label="HSN Master"
                options={hsnMasterOptions || []}
                getOptionLabel={(option) => `${option?.hsnCode}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    option.hsnCode.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {`${option?.hsnCode}`}
                      </Typography>
                    </div>
                  </li>
                )}
                renderTags={(value, props) => (
                  <Chip
                    value={value}
                    disabled={!isAdmin}
                  />
                )}
                disabled={!isAdmin}
              />


              <RHFAutocomplete
                multiple
                name='preTreatmentProcesses'
                label="Pre Treatment Processes"
                options={processOptions || []}
                getOptionLabel={(option) => `${option?.name}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    (option.name.toLowerCase().includes(inputValue.toLowerCase()) && option.processGroup === 0)
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
                  <SortableChips
                    value={value}
                    props={props}
                    setValue={setValue}
                    disabled={!isAdmin}
                    valueName='preTreatmentProcesses'
                  />
                )}
                disabled={!isAdmin}
              />

              <RHFAutocomplete
                multiple
                name='galvanizingProcesses'
                label="Galvanizing Processes"
                options={processOptions || []}
                getOptionLabel={(option) => `${option?.name}` || ''}
                filterOptions={(options, { inputValue }) =>
                  options.filter((option) =>
                    (option.name.toLowerCase().includes(inputValue.toLowerCase()) && option.processGroup === 1)
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
                  <SortableChips
                    value={value}
                    props={props}
                    setValue={setValue}
                    disabled={!isAdmin}
                    valueName='galvanizingProcesses'
                  />
                )}
                disabled={!isAdmin}
              />
            </Box>

            {values.itemProcessDuration && values.itemProcessDuration?.length > 0 && values.itemProcessDuration?.map((item, index) => (
              <Box
                key={item.processId}
                rowGap={2}
                columnGap={2}
                display="grid"
                sx={{ my: 3 }}
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(3, 1fr)',
                }}
              >
                <RHFTextField name={`itemProcessDuration[${index}].processId`} label='Process Id' />
                <RHFTextField name={`itemProcessDuration[${index}].processName`} label='Process Name' />
                <Controller
                  name={`itemProcessDuration[${index}].processDuration`}
                  control={control}
                  render={({ field, fieldState }) => {
                    console.log('fieldState', fieldState.error);
                    return (
                      <TimePicker
                        {...field}
                        label="Process Duration"
                        ampm={false}
                        views={['minutes', 'seconds']}
                        format="mm:ss"
                        value={field.value || null}
                        onChange={(value) => field.onChange(value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!fieldState.error,
                            helperText: fieldState.error?.message,
                          },
                        }}
                        sx={{ minWidth: '140px' }}
                      />
                    )
                  }}
                />
              </Box>
            ))}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentItemsMaster ? 'Create Item' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ItemsMasterNewEditForm.propTypes = {
  currentItemsMaster: PropTypes.object,
};
