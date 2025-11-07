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
import { format } from 'date-fns';
import { formatRFQId } from 'src/utils/constants';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CircularProgress } from '@mui/material';

import QuotationPDF from './quotation-details';

// ----------------------------------------------------------------------

export default function QuotationTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  quickEdit,
}) {
  const { id, customer, status, isActive, createdAt } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell onClick={() => onEditRow()} sx={{ whiteSpace: 'nowrap', cursor: 'pointer', '&:hover' : {textDecoration: 'underline'} }}>{formatRFQId(id)}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{customer?.firstName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {format(new Date(createdAt), 'dd MMM yyyy')}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 1 && 'success') ||
              (status === 2 && 'warning') ||
              (status === 3 && 'error') ||
              (status === 4 && 'warning') ||
              'default'
            }
          >
            {(status === 1 && 'Approved') ||
              (status === 2 && 'Pending Approval') ||
              (status === 3 && 'Rejected') ||
              (status === 4 && 'Created') ||
              (status === 0 && 'Draft')}
          </Label>
        </TableCell>


        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edit" placement="top" arrow>
            <IconButton
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
           <PDFDownloadLink
     document={<QuotationPDF quotation={row} />}
    fileName={row?.id || `quotation-${row.id}.pdf`}
    style={{ textDecoration: 'none' }}
  >
    {({ loading }) => (
      <Tooltip title="Download">
        <IconButton>
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <Iconify icon="eva:cloud-download-fill" />
          )}
        </IconButton>
      </Tooltip>
    )}
  </PDFDownloadLink>
                  

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

QuotationTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  quickEdit: PropTypes.any,
};
