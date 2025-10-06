import isEqual from 'lodash/isEqual';
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
import { RouterLink } from 'src/routes/components';
// _mock
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
import { useGetUsers } from 'src/api/user';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';
import { USER_STATUS_OPTIONS } from 'src/utils/constants';
import { buildFilter } from 'src/utils/filters';
import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
import UserQuickEditForm from '../user-quick-edit-form';


// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

export const _roles = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin', value:  'admin' },
  { label: 'Worker', value:'worker' },
  { label: 'Qc Admin', value: 'qc_admin' },
  { label: 'Dispatch', value:'dispatch'},
  { label: 'Supervisor', value: 'supervisor' },
];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'employeeId', label: 'Employee Id', width: 180 },
  { id: 'phoneNumber', label: 'Phone Number', width: 180 },
  { id: 'role', label: 'Role', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [quickEditRow, setQuickEditRow] = useState();

  const quickEdit = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);


  const filter = buildFilter({
    page: table.page,
    rowsPerPage: table.rowsPerPage,
    order: table.order,
    orderBy: table.orderBy,
    startDate: filters.startDate,
    endDate: filters.endDate,
    validSortFields: ['firstName', 'lastName', 'employeeId', 'phoneNumber', 'permissions', 'email'],
    searchTextValue: filters.name,
    // status: filters.status,
    isActive: filters.status,
    roles: filters.role,
    combineName: true,
  });

  const { users, totalCount, usersLoading, usersEmpty, refreshUsers } = useGetUsers(filter);

  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters,
  // });

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!users.length && canReset) || !users.length;

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
    async (id) => {
      try {
        // Make API call to delete the user
        const response = await axiosInstance.delete(`/user/${id}`);
        if (response.status === 204) {
          console.log('User deleted successfully');
          enqueueSnackbar('User Deleted Successfully');
          refreshUsers();
          confirm.onFalse();
        }
      } catch (error) {
        console.error('Error deleting user:', error.response?.data || error.message);
        enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
          variant: 'error',
        });
      }
    },
    [confirm, enqueueSnackbar, refreshUsers]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: users.length,
      totalRowsFiltered: users.length,
    });
  }, [users.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.view(id));
    },
    [router]
  );

  const handleQuickEditRow = useCallback(
    (row) => {
      setQuickEditRow(row);
      quickEdit.onTrue();
    },
    [quickEdit]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    if (users) {
      // const updatedUsers = users.filter((obj) => !obj.permissions.includes('super_admin'));
      setTableData(users);
    }
  }, [users]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="User Management"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'User Management', href: paths.dashboard.user.list },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New User
            </Button>
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
                      (tab.value === '1' && 'success') ||
                      (tab.value === '0' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && totalCount.total}
                    {tab.value === '1' && totalCount.activeTotal}

                    {tab.value === '0' && totalCount.inActiveTotal}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={users.length}
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
                  {users
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        handleQuickEditRow={(user) => {
                          handleQuickEditRow(user);
                        }}
                        quickEdit={quickEdit}
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
            count={totalCount.total}
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

      {quickEdit.value && quickEditRow && (
        <UserQuickEditForm
          currentUser={quickEditRow}
          open={quickEdit.value}
          onClose={() => {
            setQuickEditRow(null);
            quickEdit.onFalse();
          }}
          refreshUsers={refreshUsers}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

// function applyFilter({ inputData, comparator, filters }) {
//   const { name, status, role } = filters;
//   const stabilizedThis = inputData.map((el, index) => [el, index]);
//   const roleMapping = {
//     super_admin: 'Super Admin',
//     admin: 'Admin',
//     worker: 'Worker',
//     qc_Admin: 'Qc Admin',
//     dispatch: 'Dispatch',
//     supervisor: 'Supervisor'
//   };
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter((user) =>
//       Object.values(user).some((value) => String(value).toLowerCase().includes(name.toLowerCase()))
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((user) => (status === '1' ? user.isActive : !user.isActive));
//   }

//   if (role.length) {
//     inputData = inputData.filter(
//       (user) =>
//         user.permissions &&
//         user.permissions.some((userRole) => {
//           console.log(userRole);
//           const mappedRole = roleMapping[userRole];
//           console.log('Mapped Role:', mappedRole); // Check the mapped role
//           return mappedRole && role.includes(mappedRole);
//         })
//     );
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
//   validSortFields= [],
//   searchTextValue,
//   status,
//   roles,
//   combineName = false,
// }) {
//   const skip = page * rowsPerPage;
//   const limit = rowsPerPage;

//   const where = { isDeleted: false };
//   const orConditions= [];

//   // Map UI roles to DB role keys
//   const roleMapping = {
//     'Super Admin': 'super_admin',
//     'Admin': 'admin',
//     'Worker': 'worker',
//     'Qc Admin': 'qc_Admin',
//     'Dispatch': 'dispatch',
//     'Supervisor': 'supervisor',
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

//   // Search filter
//   if (searchTextValue?.trim()) {
//     const text = `%${searchTextValue.trim()}%`;

//     // Case: firstName + lastName combined search
//     if (combineName) {
//       orConditions.push({
//         and: [
//           { firstName: { like: `%${searchTextValue.split(' ')[0]}%` } },
//           { lastName: { like: `%${searchTextValue.split(' ')[1] || ''}%` } },
//         ],
//       });
//     }

//     // Loop through dynamic searchable fields
//     validSortFields.forEach((field) => {
//       orConditions.push({ [field]: { like: text } });
//     });
//   }

//   // 🔹 Roles filter
//   if (roles?.length) {
//     const dbRoles = roles.map((uiRole) => roleMapping[uiRole] || uiRole);
//     orConditions.push(...dbRoles.map((role) => ({
//       permissions: { like: `%${role}%`, options: 'i' },
//     })));
//   }

//   if (orConditions.length) {
//     where.or = orConditions;
//   }


//   // Only attach OR if needed
//   if (orConditions.length) {
//     where.or = orConditions;
//   }

//   // Sorting
//   const orderFilter =
//     validSortFields.includes(orderBy) && order
//       ? [`${orderBy} ${order === 'desc' ? 'DESC' : 'ASC'}`]
//       : undefined;

//   const filter = { skip, limit, order: orderFilter, where };
//   console.log('buildFilter (final with role mapping):', JSON.stringify(filter, null, 2));
//   return filter;
// }


