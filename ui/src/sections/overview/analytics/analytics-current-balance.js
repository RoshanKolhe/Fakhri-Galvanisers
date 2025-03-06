import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
// utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function AnalyticsCurrentBalance({
  title,
  sentAmount,
  lastOrderTotal,
  outStanding,
  currentOrderTotal,
  sx,
  ...other
}) {
  return (
    <Card sx={{ p: 3, ...sx }} {...other}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>

      <Stack spacing={2}>
        <Typography variant="h3">{fCurrency(outStanding) || '0'}</Typography>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Last Order Total
          </Typography>
          <Typography variant="body2">{fCurrency(lastOrderTotal) || 0}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Current Order Total
          </Typography>
          <Typography variant="body2">{fCurrency(currentOrderTotal) || 0}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

AnalyticsCurrentBalance.propTypes = {
  lastOrderTotal: PropTypes.number,
  currentOrderTotal: PropTypes.number,
  outStanding: PropTypes.number,
  sentAmount: PropTypes.number,
  sx: PropTypes.object,
  title: PropTypes.string,
};
