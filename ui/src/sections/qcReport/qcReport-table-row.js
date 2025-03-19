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
import { formatQcReportId } from 'src/utils/constants';
import { Grid } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function QcReportTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
}) {
  const { user } = useAuthContext();
  const isAdmin = user
    ? user.permissions.includes('super_admin') || user.permissions.includes('admin')
    : false;

  const { material, status, id, order, qcTests } = row;

  const confirm = useBoolean();

  const collapse = useBoolean();

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell> */}

      <TableCell>{formatQcReportId(id)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{order.orderId}</TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={`${order?.customer?.firstName} ${
            order?.customer?.lastName ? order?.customer?.lastName : ''
          }`}
          src={order?.customer?.avatar?.fileUrl}
          sx={{ mr: 2 }}
        />

        <ListItemText
          primary={`${order?.customer?.firstName} ${
            order?.customer?.lastName ? order?.customer?.lastName : ''
          }`}
          secondary={order?.customer.email}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{material.materialType}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={(status === 0 && 'warning') || (status === 1 && 'success') || 'default'}
        >
          {(status === 0 && 'Pending') || (status === 1 && 'Completed')}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {qcTests && qcTests.length > 0 ? (
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
        ) : null}

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
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
              <Grid item xs={2}>
                Specification
              </Grid>
              <Grid item xs={2}>
                Test Detail
              </Grid>
              <Grid item xs={2}>
                Requirement
              </Grid>
              <Grid item xs={2}>
                Result
              </Grid>
              <Grid item xs={2}>
                Observed
              </Grid>
            </Grid>

            {/* Table Rows */}
            {qcTests?.map((item) => (
              <Grid
                container
                key={item.id}
                sx={{
                  p: 1.5,
                  borderBottom: (theme) => `solid 1px ${theme.palette.background.neutral}`,
                }}
              >
                <Grid item xs={2}>
                  {item?.specification}
                </Grid>
                <Grid item xs={2}>
                  {item?.testDetails}
                </Grid>
                <Grid item xs={2}>
                  {item?.requirement}
                </Grid>
                <Grid item xs={2}>
                  {item?.testResult}
                </Grid>
                <Grid item xs={2}>
                  <Label
                    variant="soft"
                    color={item?.observed === 'satisfactory' ? 'success' : 'warning'}
                  >
                    {item?.observed === 'satisfactory' ? 'Satisfactory' : 'Un Satisfactory'}
                  </Label>
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
            popover.onClose();
            onViewRow();
          }}
        >
          <Iconify icon="carbon:view-filled" />
          View
        </MenuItem>

        {isAdmin && (
          <MenuItem
            onClick={() => {
              popover.onClose();
              onEditRow();
            }}
          >
            <Iconify icon="grommet-icons:test" />
            Qc Tests
          </MenuItem>
        )}
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

QcReportTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
