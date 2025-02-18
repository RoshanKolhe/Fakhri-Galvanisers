import sum from 'lodash/sum';
import { useCallback, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
// utils
import { fCurrency } from 'src/utils/format-number';

// components
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { Autocomplete, TextField } from '@mui/material';
import { useGetHsnMasters } from 'src/api/hsnMaster';

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails() {
  const { control, setValue, watch, resetField } = useFormContext();

  const { hsnMasters, hsnMastersLoading, hsnMastersEmpty, refreshQuotations } = useGetHsnMasters();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'materials',
  });

  const values = watch();
  const materials = watch('materials');

  const calculateTotals = (allMaterials) => {
    let subtotal = 0;
    let totalTax = 0;
    let grandTotal = 0;

    allMaterials.forEach((material) => {
      const pricePerUnit = parseFloat(material?.pricePerUnit) || 0;
      const quantity = parseFloat(material?.quantity) || 0;
      const tax = parseFloat(material?.tax) || 0;
      if (pricePerUnit && quantity) {
        const totalPrice = pricePerUnit * quantity;
        const taxAmount = (totalPrice * tax) / 100;

        subtotal += totalPrice;
        totalTax += taxAmount;
        grandTotal += totalPrice + taxAmount;
      }
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };

  const totals = calculateTotals(materials);

  const calculatePriceAfterTax = (index) => {
    const pricePerUnit = parseFloat(materials[index]?.pricePerUnit) || 0;
    const quantity = parseFloat(materials[index]?.quantity) || 0;
    const tax = parseFloat(materials[index]?.tax) || 0;

    if (pricePerUnit && quantity) {
      const totalPrice = pricePerUnit * quantity;
      const priceAfterTax = totalPrice * (1 + tax / 100);

      setValue(`materials[${index}].priceAfterTax`, priceAfterTax.toFixed(2), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(totals.subtotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totals.totalTax) || '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totals.grandTotal) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Details:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <RHFTextField
                name={`materials[${index}].materialType`}
                label="Material Type"
                disabled
              />
              <RHFTextField
                type="number"
                name={`materials[${index}].quantity`}
                label="Quantity"
                onChange={(e) => {
                  setValue(`materials[${index}].quantity`, e.target.value);
                  calculatePriceAfterTax(index);
                }}
                disabled
              />
              <RHFSelect name={`materials[${index}].billingUnit`} label="Billing Unit" disabled>
                <MenuItem key="kg" value="kg">
                  Kg
                </MenuItem>
                <MenuItem key="nos" value="nos">
                  Nos
                </MenuItem>
              </RHFSelect>
              <Controller
                name={`materials[${index}].hsnNo`}
                control={control}
                render={({
                  field: { onChange, value: fieldValue, ...fieldProps },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    {...fieldProps}
                    options={hsnMasters}
                    getOptionLabel={(option) => (option ? option.hsnCode : '')}
                    isOptionEqualToValue={(option, value) => option.hsnCode === value.hsnCode}
                    onChange={(_, selectedOption) => {
                      onChange(selectedOption);
                      if (selectedOption) {
                        setValue(`materials[${index}].tax`, selectedOption.tax || 0);
                        calculatePriceAfterTax(index);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hsn"
                        fullWidth
                        sx={{ flex: 2 }}
                        error={!!error}
                        helperText={error ? error?.message : ''}
                      />
                    )}
                    value={fieldValue || null}
                    sx={{
                      width: '100%',
                    }}
                    disabled
                  />
                )}
              />
              <RHFTextField
                name={`materials[${index}].tax`}
                label="Tax"
                sx={{
                  width: '50%',
                }}
                disabled
              />
              <RHFTextField name={`materials[${index}].microns`} label="Microns" disabled />
              <RHFTextField
                name={`materials[${index}].pricePerUnit`}
                label="Price Per Unit"
                onChange={(e) => {
                  setValue(`materials[${index}].pricePerUnit`, e.target.value);
                  calculatePriceAfterTax(index);
                }}
                disabled
              />
              <RHFTextField
                name={`materials[${index}].priceAfterTax`}
                label="Price After Tax"
                disabled
              />
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      {renderTotal}
    </Box>
  );
}
