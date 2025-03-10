import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
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
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { formatChallanId, formatRFQId } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function ChallanTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  quickEdit,
  handleQuickEditRow,
}) {
  const { id, quotationId, vehicleNumber, grossWeight, netWeight, order, status } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatChallanId(id)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatRFQId(quotationId)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{vehicleNumber}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{grossWeight}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{netWeight}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{order ? order?.orderId : '-'}</TableCell>

        {/* <TableCell>
          <Label variant="soft" color={(status && 'success') || (!status && 'error') || 'default'}>
            {status ? 'Active' : 'In-Active'}
          </Label>
        </TableCell> */}

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={() => {
                onEditRow();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View" placement="top" arrow>
            <IconButton
              onClick={() => {
                onViewRow();
              }}
            >
              <Iconify icon="carbon:view-filled" />
            </IconButton>
          </Tooltip>

          {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
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

ChallanTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  quickEdit: PropTypes.any,
  handleQuickEditRow: PropTypes.func,
};
