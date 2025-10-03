import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// utils
import { fTimestamp } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
import { useGetOrders } from 'src/api/order';
import { useGetCustomersWithFilter } from 'src/api/customer';
import { ORDER_STATUS_OPTIONS } from 'src/utils/constants';
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/routes/components';
import { buildFilter } from 'src/utils/filters';
import OrderTableRow from '../order-table-row';
import OrderTableToolbar from '../order-table-toolbar';
import OrderTableFiltersResult from '../order-table-filters-result';


// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...ORDER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'orderId', label: 'Order', width: 116 },
  { id: 'name', label: 'Customer' },
  { id: 'createdAt', label: 'Date', width: 140 },
  { id: 'materials', label: 'Materials', width: 120, align: 'center' },
  { id: 'status', label: 'Status', width: 110 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  additionalConditions: {
    customerId: []
  }
};

// ----------------------------------------------------------------------

export default function OrderListView() {
  const { user } = useAuthContext();
  const table = useTable({ defaultOrderBy: 'orderId' });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const filter = buildFilter({
    page: table.page,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
    startDate: filters.startDate,
    endDate: filters.endDate,
    validSortFields: ['orderId'],
    searchTextValue: filters.name,
    status: filters.status,
    additionalWhereOrConditions: [
      { customerId: filters.additionalConditions.customerId.length > 0 ? { inq: filters.additionalConditions.customerId } : null },
    ].filter(Boolean),
    combineName: true,
  });
  const { orders, totalcount, ordersLoading, ordersEmpty, refreshOrders } = useGetOrders(filter);

  const customerFIlter = {
    where: {
      or: [
        { firstName: { like: `%${filters.name.trim() || ''}%`, options: 'i' } },
        { lastName: { like: `%${filters.name.trim() || ''}%`, options: 'i' } },
        { email: { like: `%${filters.name.trim() || ''}%`, options: 'i' } },
      ],
    },
    limit: 20,
    fields: { id: true }
  };
  const { filteredCustomers, filteredCustomersEmpty } = useGetCustomersWithFilter(encodeURIComponent(JSON.stringify(customerFIlter)));

  useEffect(() => {
    if (filteredCustomers.length > 0 && !filteredCustomersEmpty && filters.name.length > 3) {
      console.table(filteredCustomers);
      const ids = filteredCustomers.map((customer) => customer.id);
      filters.additionalConditions.customerId = ids || [];
    } else {
      filters.additionalConditions.customerId = [];
    }
  }, [filteredCustomers, filteredCustomersEmpty, filters]);

  console.log(filter);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters,
  //   dateError,
  // });

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  const denseHeight = table.dense ? 52 : 72;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!orders.length && canReset) || !orders.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(orders.length);
    },
    [orders.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: orders.length,
      totalRowsFiltered: orders.length,
    });
  }, [orders.length, table, tableData]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  useEffect(() => {
    if (orders) {
      setTableData(orders);
    }
  }, [orders]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Order',
              href: paths.dashboard.order.root,
            },
            { name: 'List' },
          ]}
          action={
            ['super_admin', 'admin', 'supervisor'].some(role => user?.permissions?.includes(role)) ? (
              <Button
                component={RouterLink}
                href={paths.dashboard.order.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Order
              </Button>
            ) : null
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 0 && 'success') ||
                      (tab.value === 1 && 'warning') ||
                      (tab.value === 2 && 'info') ||
                      (tab.value === 3 && 'secondary') ||
                      (tab.value === 4 && 'warning') ||
                      (tab.value === 5 && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && totalcount.total}
                    {tab.value === 0 && totalcount.materialReceivedTotal}

                    {tab.value === 1 && totalcount.inProcessTotal}
                    {tab.value === 2 && totalcount.materialReadyTotal}
                    {tab.value === 3 && totalcount.readyToDispatchTotal}
                    {tab.value === 4 && orders.filter((order) => order.status === 4).length}
                    {tab.value === 5 && orders.filter((order) => order.status === 5).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={orders.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  showCheckbox={false}
                />

                <TableBody>
                  {orders
                    .map((row) => (
                      <OrderTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalcount.total}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

// function applyFilter({ inputData, comparator, filters, dateError }) {
//   const { status, name, startDate, endDate } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (order) =>
//         order.orderId.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         order.customer.firstName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         order.customer.lastName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         order.customer.email.toLowerCase().indexOf(name.toLowerCase()) !== -1
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((order) => order.status === status);
//   }

//   if (!dateError) {
//     if (startDate && endDate) {
//       inputData = inputData.filter(
//         (order) =>
//           fTimestamp(order.createdAt) >= fTimestamp(startDate) &&
//           fTimestamp(order.createdAt) <= fTimestamp(endDate)
//       );
//     }
//   }

//   return inputData;
// }


// export function formatDate(date) {
//   return date instanceof Date ? date.toISOString().split('T')[0] : date;
// }


// export function buildFilter({
//   page,
//   rowsPerPage,
//   order,
//   orderBy,
//   startDate,
//   endDate,
//   validSortFields = [],
//   searchTextValue,
//   status,
//   roles,
//   additionalWhereOrConditions = [],
//   combineName = false,
// }) {
//   const skip = page * rowsPerPage;
//   const limit = rowsPerPage;

//   const where = { isDeleted: false };
//   const orConditions = [];

//   // Map UI roles to DB role keys
//   const roleMapping = {
//     'Super Admin': 'super_admin',
//     Admin: 'admin',
//     Worker: 'worker',
//     'Qc Admin': 'qc_Admin',
//     Dispatch: 'dispatch',
//     Supervisor: 'supervisor',
//   };

//   // Status filter
//   if (status && status !== 'all') {
//     where.isActive = status === '1';
//   }

//   // Date filter
//   if (startDate && endDate) {
//     where.createdAt = { between: [formatDate(startDate), formatDate(endDate)] };
//   } else if (startDate) {
//     where.createdAt = { gte: formatDate(startDate) };
//   } else if (endDate) {
//     where.createdAt = { lte: formatDate(endDate) };
//   }

//   // Search text filter
//   if (searchTextValue?.trim()) {
//     const text = searchTextValue.trim();

//     // Name search
//     // if (combineName) {
//     //   const [first, last] = text.split(' ');
//     //   const nameConditions = [];
//     //   if (first) nameConditions.push({ firstName: { like: `%${first}%` } });
//     //   if (last) nameConditions.push({ lastName: { like: `%${last}%` } });

//     //   if (nameConditions.length > 1) {
//     //     orConditions.push({ and: nameConditions });
//     //   } else if (nameConditions.length === 1) {
//     //     orConditions.push(nameConditions[0]);
//     //   }
//     // }

//     // Other fields
//     validSortFields.forEach((field) => {
//       if (['id',].includes(field)) {
//         // Only search numeric fields if input is a valid number
//         if (!Number.isNaN(Number(text))) {
//           orConditions.push({ [field]: Number(text) });
//         }
//       } else {
//         orConditions.push({ [field]: { like: `%${text}%` } });
//       }
//     });
//   }

//   // Roles filter
//   if (roles?.length) {
//     const dbRoles = roles.map((uiRole) => roleMapping[uiRole] || uiRole);
//     orConditions.push(
//       ...dbRoles.map((role) => ({ permissions: { like: `%${role}%`, options: 'i' } }))
//     );
//   }

//   if (orConditions.length) {
//     where.or = orConditions;
//   }
//   if (additionalWhereOrConditions?.length) {
//     additionalWhereOrConditions.forEach((cond) => {
//       // Only push the condition if it has at least one key with a non-null value
//       console.log('condition', cond);
//       const validKeys = Object.keys(cond || {}).filter(
//         (key) => cond[key] !== null && cond[key] !== undefined
//       );

//       console.log('valid keys', validKeys);
//       if (validKeys.length > 0) {
//         // Only include the valid keys
//         const validCond = {};
//         validKeys.forEach((key) => {
//           validCond[key] = cond[key];
//         });
//         where.or.push(validCond);
//       }
//     });
//   }

//   const filter = { skip, limit, where };

//   console.log('buildFilter (final):', JSON.stringify(filter, null, 2));
//   return filter;
// }
