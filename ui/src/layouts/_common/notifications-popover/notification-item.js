import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
// utils
import { fToNow } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import FileThumbnail from 'src/components/file-thumbnail';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function NotificationItem({ notification, drawer }) {
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;
  const router = useRouter();

  const renderAvatar = (
    <ListItemAvatar>
      {notification.avatarUrl ? (
        <Avatar src={notification?.avatarUrl} sx={{ bgcolor: 'background.neutral' }} />
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'background.neutral',
          }}
        >
          <Box
            component="img"
            src={`/assets/icons/notification/${(notification.type === 'order' && 'ic_order') ||
              (notification.type === 'quotation' && 'ic_quotation') ||
              (notification.type === 'mail' && 'ic_mail') ||
              (notification.type === 'delivery' && 'ic_delivery') ||
              (notification.type === 'material' && 'ic_material')
              }.svg`}
            sx={{ width: 24, height: 24 }}
          />
        </Stack>
      )}
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={reader(notification.title)}
      secondary={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ typography: 'caption', color: 'text.disabled' }}
          divider={
            <Box
              sx={{ width: 2, height: 2, bgcolor: 'currentColor', mx: 0.5, borderRadius: '50%' }}
            />
          }
        >
          {fToNow(notification.createdAt)}
        </Stack>
      }
    />
  );

  const renderUnReadBadge = !notification.status && (
    <Box
      sx={{
        top: 26,
        width: 8,
        height: 8,
        right: 20,
        borderRadius: '50%',
        bgcolor: 'info.main',
        position: 'absolute',
      }}
    />
  );

  const quotationAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      {notification?.extraDetails?.rfqId && (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            console.log('here');
            drawer.onFalse();
            router.push(paths.dashboard.quotation.view(notification.extraDetails.rfqId));
          }}
        >
          View RFQ
        </Button>
      )}
      {isAdmin && notification?.extraDetails?.rfqId ? (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            drawer.onFalse();
            router.push(paths.dashboard.quotation.edit(notification.extraDetails.rfqId));
          }}
        >
          Generate Quote
        </Button>
      ) : null}
    </Stack>
  );

    const orderAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      {notification?.extraDetails?.orderId && (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            console.log('here');
            drawer.onFalse();
            router.push(paths.dashboard.order.view(notification.extraDetails.orderId));
          }}
        >
          View Order
        </Button>
      )}
      {isAdmin && notification?.extraDetails?.orderId ? (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            drawer.onFalse();
            router.push(paths.dashboard.order.edit(notification.extraDetails.orderId));
          }}
        >
          View Order
        </Button>
      ) : null}
    </Stack>
  );

  const inquiryAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      <Button
        size="small"
        variant="contained"
        onClick={() => {
          drawer.onFalse();
          router.push(paths.dashboard.inquiry.list);
        }}
      >
        View
      </Button>
    </Stack>
  );

  const fileAction = (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        pl: 1,
        p: 1.5,
        mt: 1.5,
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
      }}
    >
      <FileThumbnail
        file="http://localhost:8080/httpsdesign-suriname-2015.mp3"
        sx={{ width: 40, height: 40 }}
      />

      <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} flexGrow={1} sx={{ minWidth: 0 }}>
        <ListItemText
          disableTypography
          primary={
            <Typography variant="subtitle2" component="div" sx={{ color: 'text.secondary' }} noWrap>
              design-suriname-2015.mp3
            </Typography>
          }
          secondary={
            <Stack
              direction="row"
              alignItems="center"
              sx={{ typography: 'caption', color: 'text.disabled' }}
              divider={
                <Box
                  sx={{
                    mx: 0.5,
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    bgcolor: 'currentColor',
                  }}
                />
              }
            >
              <span>2.3 GB</span>
              <span>30 min ago</span>
            </Stack>
          }
        />

        <Button size="small" variant="outlined">
          Download
        </Button>
      </Stack>
    </Stack>
  );

  const tagsAction = (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
      <Label variant="outlined" color="info">
        Design
      </Label>
      <Label variant="outlined" color="warning">
        Dashboard
      </Label>
      <Label variant="outlined">Design system</Label>
    </Stack>
  );

  const paymentAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      {notification?.extraDetails?.paymentId && (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            console.log('here');
            drawer.onFalse();
            router.push(paths.dashboard.invoice.details(notification.extraDetails.paymentId));
          }}
        >
          View
        </Button>
      )}

    </Stack>
  );

  const materialActions = (
    <Stack spacing={1} direction="row" sx={{ mt: 1.5 }}>
      {notification?.extraDetails?.challanId && (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            drawer.onFalse();
            router.push(paths.dashboard.challan.view(notification.extraDetails.challanId));
          }}
        >
          View Challan
        </Button>
      )}

    </Stack>
  );

  return (
    <ListItemButton
      disableRipple
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {renderUnReadBadge}

      {renderAvatar}

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
        {notification.type === 'quotation' && quotationAction}
        {notification.type === 'order' && orderAction}
        {notification.type === 'inquiry' && inquiryAction}
        {notification.type === 'file' && fileAction}
        {notification.type === 'tags' && tagsAction}
        {notification.type === 'payment' && paymentAction}
        {notification.type === 'material' && materialActions}
      </Stack>
    </ListItemButton>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object,
  drawer: PropTypes.any,
};

// ----------------------------------------------------------------------

function reader(data) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
