import PropTypes from 'prop-types';
import { format } from 'date-fns';
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
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Grid, Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

export default function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const { materials, status, orderId, createdAt, customer } = row;

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell> */}

      <TableCell>
        <Box
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {orderId}
        </Box>
      </TableCell>

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
        <ListItemText
          primary={format(new Date(createdAt), 'dd MMM yyyy')}
          secondary={format(new Date(createdAt), 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell align="center"> {materials.length} </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 0 && 'success') ||
            (status === 1 && 'warning') ||
            (status === 2 && 'info') ||
            (status === 3 && 'secondary') ||
            (status === 4 && 'error') ||
            'default'
          }
        >
          {(status === 1 && 'In Process') ||
            (status === 2 && 'Material Ready') ||
            (status === 3 && 'Ready To dispatch') ||
            (status === 4 && 'Cancelled') ||
            (status === 0 && 'Material Received')}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        >
          <Iconify
            icon={collapse.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={() => onViewRow()}>
          <Tooltip title='view'>
            <Iconify icon="solar:eye-bold" />
          </Tooltip>
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5, p: 1.5 }}>
            {/* Table Head */}
            <Grid
              container
              sx={{
                bgcolor: 'action.hover',
                fontWeight: 'bold',
                borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
                p: 1,
              }}
            >
              <Grid item xs={3}>
                Material Type
              </Grid>
              <Grid item xs={3}>
                Quantity
              </Grid>
              <Grid item xs={3}>
                HSN Code
              </Grid>
              <Grid item xs={3}>
                Microns
              </Grid>
            </Grid>

            {/* Table Rows */}
            {materials?.map((item) => (
              <Grid
                container
                key={item.id}
                sx={{
                  p: 1.5,
                  borderBottom: (theme) => `solid 1px ${theme.palette.background.neutral}`,
                }}
              >
                <Grid item xs={3}>
                  {item?.materialType}
                </Grid>
                <Grid item xs={3}>
                  {item?.totalQuantity}
                </Grid>
                <Grid item xs={3}>
                  {item?.hsnCode}
                </Grid>
                <Grid item xs={3}>
                  {item?.microns}
                </Grid>
              </Grid>
            ))}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
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

OrderTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
