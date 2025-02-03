/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
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
import { Box, Collapse, Paper, Stack } from '@mui/material';

// ----------------------------------------------------------------------

export default function InquiryTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  handleQuickEditRow,
}) {
  const {
    firstName,
    lastName,
    materials,
    status,
    company,
    email,
    phoneNumber,
    gstIn,
    designation,
    address,
  } = row;

  console.log(materials);

  const confirm = useBoolean();

  const popover = usePopover();

  const collapse = useBoolean();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      {/* <TableCell padding="checkbox">
      <Checkbox checked={selected} onClick={onSelectRow} />
    </TableCell> */}

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          primary={`${firstName} ${lastName || ''}`}
          secondary={email}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{phoneNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{company}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{gstIn}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{designation}</TableCell>
      <TableCell
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 200,
        }}
      >
        <Tooltip title={address}>
          <span>{address}</span>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 1 && 'success') ||
            (status === 2 && 'success') ||
            (!status && 'error') ||
            'default'
          }
        >
          {status === 1 ? 'Complete' : status === 2 ? 'Converted' : 'Incomplete'}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {materials && materials.length > 0 ? (
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
          <Stack component={Paper} sx={{ m: 1.5 }}>
            {/* Add headings for the secondary row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: (theme) => theme.spacing(1, 2, 1, 1),
                bgcolor: 'action.hover',
                fontWeight: 'bold',
                borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
              }}
            >
              <Box>Material Type</Box>
              <Box>Quantity (Nos)</Box>
              <Box>Quantity (Kg)</Box>
              <Box>Microns</Box>
            </Stack>

            {/* Map over materials to render rows */}
            {materials?.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
                  },
                }}
              >
                <Box>{item?.materialType}</Box>
                <Box>{item?.quantityInNos}</Box>
                <Box>{item?.quantityInKg}</Box>
                <Box>{item?.microns}</Box>
              </Stack>
            ))}
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {materials && materials.length > 0 ? renderSecondary : null}

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top">
        {status !== 2 ? (
          <MenuItem
            onClick={() => {
              handleQuickEditRow(row);
              popover.onClose();
            }}
          >
            <Iconify icon="mdi:account-convert" />
            Convert to Customer
          </MenuItem>
        ) : null}
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

InquiryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  handleQuickEditRow: PropTypes.func,
};
