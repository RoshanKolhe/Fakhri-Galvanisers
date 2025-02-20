import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
//
import { ORDER_STATUS_OPTIONS } from 'src/utils/constants';
import { useGetOrder } from 'src/api/order';
import OrderDetailsInfo from '../order-details-info';
import OrderDetailsToolbar from '../order-details-toolbar';
import OrderDetailsHistory from '../order-details-history';
import OrderMaterialForm from '../order-materials-form';

// ----------------------------------------------------------------------

export default function OrderDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;
  const { order } = useGetOrder(id);
  const [currentOrder, setCurrentOrder] = useState();
  const [status, setStatus] = useState();

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);

  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
      setStatus(order.status);
    }
  }, [order]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <OrderDetailsToolbar
        backLink={paths.dashboard.order.root}
        orderNumber={currentOrder?.orderId}
        createdAt={currentOrder?.createdAt}
        status={status}
        onChangeStatus={handleChangeStatus}
        statusOptions={ORDER_STATUS_OPTIONS}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <OrderDetailsHistory history={currentOrder?.timeline} order={currentOrder} />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <OrderDetailsInfo
            customer={currentOrder?.customer}
            dispatch={currentOrder?.dispatch}
            payment={currentOrder?.payment}
            shippingAddress={currentOrder?.shippingAddress}
          />
        </Grid>
        <Grid xs={12}>
          <OrderMaterialForm currentOrder={currentOrder} />
        </Grid>
      </Grid>
    </Container>
  );
}
