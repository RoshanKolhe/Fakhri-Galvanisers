import { useSearchParams } from 'react-router-dom';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useSettingsContext } from 'src/components/settings';
//
import { useGetChallan } from 'src/api/challan';
import OrderMaterialForm from '../order-materials-form';

// ----------------------------------------------------------------------

export default function OrderNewDetailsView() {
  const settings = useSettingsContext();
  const [searchParams] = useSearchParams();
  const challanId = searchParams.get('challanId');
  const { challan: currentChallan, challanLoading } = useGetChallan(challanId);

  console.log(challanId, currentChallan)
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Grid container spacing={3}>
        {(currentChallan && !challanLoading) ? <Grid xs={12}>
          <OrderMaterialForm currentChallan={currentChallan} />
        </Grid> : (
          <Grid xs={12}>
            <OrderMaterialForm />
          </Grid>)}
      </Grid>
    </Container>
  );
}