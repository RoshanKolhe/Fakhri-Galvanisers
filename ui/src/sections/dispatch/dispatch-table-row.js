import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { formatDispatchId } from 'src/utils/constants';
import { Grid, Tooltip } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function DispatchTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
}) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;
  const { status, id, order, customer } = row;

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell> */}

      <TableCell onClick={() => onViewRow()} sx={{cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}>{formatDispatchId(id)}</TableCell>

      <TableCell onClick={() => navigate(paths.dashboard.order.details(order?.id))} sx={{ whiteSpace: 'nowrap', cursor: 'pointer', '&:hover': {textDecoration: 'underline'} }}>{order?.orderId || "N/A"}</TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={`${customer?.firstName} ${customer?.lastName ? customer?.lastName : ''}`}
          src={customer?.avatar?.fileUrl}
          sx={{ mr: 2 }}
        />

        <ListItemText
          primary={`${customer?.firstName} ${customer?.lastName ? customer?.lastName : ''}`}
          secondary={customer?.email}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 0 && 'warning') ||
            (status === 1 && 'info') || // 'info' for "Documents Uploaded"
            (status === 2 && 'success') || // 'success' for "Completed"
            'default'
          }
        >
          {(status === 0 && 'Pending') ||
            (status === 1 && 'Documents Uploaded') ||
            (status === 2 && 'Completed')}
        </Label>
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={() => onViewRow()}>
          <Tooltip title='view'>
            <Iconify icon="solar:eye-bold" />
          </Tooltip>
        </IconButton>

        {isAdmin && <IconButton color={popover.open ? 'inherit' : 'default'} onClick={() => onEditRow()}>
          <Tooltip title='Edit'>
            <Iconify icon="solar:pen-bold" />
          </Tooltip>
        </IconButton>}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {isAdmin ? (
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        ) : null}

        <MenuItem
          onClick={() => {
            popover.onClose();
            onViewRow();
          }}
        >
          <Iconify icon="carbon:view-filled" />
          View
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

DispatchTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
