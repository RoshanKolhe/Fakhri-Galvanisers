import { useFormContext } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export default function InvoiceNewEditAddress() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const upMd = useResponsive('up', 'md');

  const values = watch();

  const { invoiceTo } = values;

  return (
    <Stack
      spacing={{ xs: 3, md: 5 }}
      direction={{ xs: 'column', md: 'row' }}
      divider={
        <Divider
          flexItem
          orientation={upMd ? 'vertical' : 'horizontal'}
          sx={{ borderStyle: 'dashed' }}
        />
      }
      sx={{ p: 3 }}
    >
      <Stack sx={{ width: 1 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
            From:
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2">Hylite</Typography>
          <Typography variant="body2">
            A/129, T.T.C. MIDC Indl.Area, Khairane Fire Brigade Lane Pawane, Navi Mumbai, India.
          </Typography>
          <Typography variant="body2"> 7253000111</Typography>
        </Stack>
      </Stack>

      <Stack sx={{ width: 1 }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
            To:
          </Typography>
        </Stack>

        {invoiceTo ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">{`${invoiceTo?.firstName} ${
              invoiceTo?.lastName ? invoiceTo?.lastName : ''
            }`}</Typography>
            <Typography variant="body2">{invoiceTo?.fullAddress}</Typography>
            <Typography variant="body2"> {invoiceTo?.phoneNumber}</Typography>
          </Stack>
        ) : (
          <Typography typography="caption" sx={{ color: 'error.main' }}>
            {errors.invoiceTo?.message}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
