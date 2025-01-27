// @mui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
// components
import { RouterLink } from 'src/routes/components';
import LinearAlternativeLabel from 'src/sections/_examples/mui/stepper-view/linear-alternative-label-stepper';
import { Card } from '@mui/material';

// ----------------------------------------------------------------------

export default function ModernRegisterView() {
  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Request for a Quote</Typography>

      <Stack direction="row" justifyContent="center" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.jwt.customerLogin} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
      <LinearAlternativeLabel />
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{ color: 'text.secondary', mt: 2.5, typography: 'caption', textAlign: 'center' }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  return (
    <Card
      sx={{
        py: 5,
        px: 3,
        maxWidth: 820,
        width: '100%',
      }}
    >
      {renderHead}
      {renderTerms}
    </Card>
  );
}
