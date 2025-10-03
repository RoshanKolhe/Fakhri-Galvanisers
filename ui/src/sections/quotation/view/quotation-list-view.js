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
import { useGetQuotations } from 'src/api/quotation';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'notistack';
import { _roles, RFQ_STATUS_OPTIONS } from 'src/utils/constants';
import { buildFilter } from 'src/utils/filters';
import { useGetCustomersWithFilter } from 'src/api/customer';

import QuotationTableRow from '../quotation-table-row';
import QuotationTableToolbar from '../quotation-table-toolbar';
import QuotationTableFiltersResult from '../quotation-table-filters-result';
import QuotationQuickEditForm from '../quotation-quick-edit-form';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...RFQ_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'id', label: 'RFQ ID' },
  { id: 'customer.firstName', label: 'Customer Name', width: 180 },
  { id: 'createdAt', label: 'Submission Date', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
  additionalConditions:{
    customerId:[]
  }
};

// ----------------------------------------------------------------------

export default function QuotationListView() {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [quickEditRow, setQuickEditRow] = useState();

  const quickEdit = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);

   const filter = buildFilter ({
     page: table.page,
      rowsPerPage: table.rowsPerPage,
      order: table.order,
      orderBy: table.orderBy,
      startDate: filters.startDate,
      endDate: filters.endDate,
      validSortFields: ['id'],
      searchTextValue: filters.name,
      status: filters.status,
      additionalWhereOrConditions: [
      { customerId: filters.additionalConditions.customerId.length > 0 ? { inq: filters.additionalConditions.customerId } : null },
    ].filter(Boolean),
    combineName: true,
    });

  const { quotations,totalcount, quotationsLoading, quotationsEmpty, refreshQuotations } = useGetQuotations(filter);

   const customerFIlter = {
      where: {
        or: [
          { firstName: { like: `%${filters.name.trim() || ''}%`, options: 'i' } },
          { lastName: { like: `%${filters.name.trim() || ''}%`, options: 'i' } },
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

  const notFound = (!quotations.length && canReset) || !quotations.length;

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
        // Make API call to delete the quotation
        const response = await axiosInstance.delete(`/quotation/${id}`);
        if (response.status === 204) {
          console.log('Quotation deleted successfully');
          enqueueSnackbar('Quotation Deleted Successfully');
          confirm.onFalse();
          refreshQuotations();
        }
      } catch (error) {
        console.error('Error deleting quotation:', error.response?.data || error.message);
        enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
          variant: 'error',
        });
      }
    },
    [confirm, enqueueSnackbar, refreshQuotations]
  );

  const handleDeleteRows = useCallback(() => {
    console.log('here');
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: quotations.length,
      totalRowsFiltered: quotations.length,
    });
  }, [quotations.length,  table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.quotation.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.quotation.view(id));
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
    if (quotations) {
      // const updatedQuotations = quotations.filter((obj) => !obj.permissions.includes('super_admin'));
      setTableData(quotations);
    }
  }, [quotations]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Quotation Management"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Quotation Management', href: paths.dashboard.quotation.list },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.quotation.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Quotation
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
                      (tab.value === 1 && 'success') ||
                      (tab.value === 2 && 'warning') ||
                      (tab.value === 3 && 'error') ||
                      (tab.value === 4 && 'warning') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && totalcount.total}
                    {tab.value === 1 &&
                      totalcount.approvedTotal}

                    {tab.value === 2 &&
                     totalcount.pendingApprovalTotal}
                    {tab.value === 3 &&
                     totalcount.rejectedTotal}
                    {tab.value === 4 &&
                      totalcount.createdTotal}
                    {tab.value === 0 &&
                      totalcount.draftTotal}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <QuotationTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <QuotationTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={quotations.length}
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
                  {quotations
                    .map((row) => (
                      <QuotationTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        handleQuickEditRow={(quotation) => {
                          handleQuickEditRow(quotation);
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

      {quickEdit.value && quickEditRow && (
        <QuotationQuickEditForm
          currentQuotation={quickEditRow}
          open={quickEdit.value}
          onClose={() => {
            setQuickEditRow(null);
            quickEdit.onFalse();
          }}
          refreshQuotations={refreshQuotations}
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
//   };
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter((quotation) =>
//       Object.values(quotation).some((value) =>
//         String(value).toLowerCase().includes(name.toLowerCase())
//       )
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((quotation) => {
//       if (status === 1) return quotation.status === 1;
//       if (status === 2) return quotation.status === 2;
//       if (status === 3) return quotation.status === 3;
//       if (status === 4) return quotation.status === 4;
//       return quotation.status === 0;
//     });
//   }

//   if (role.length) {
//     inputData = inputData.filter(
//       (quotation) =>
//         quotation.permissions &&
//         quotation.permissions.some((quotationRole) => {
//           console.log(quotationRole);
//           const mappedRole = roleMapping[quotationRole];
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
//   validSortFields = [],
//   searchTextValue,
//   status,
//   roles,
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
//     if (combineName) {
//       const [first, last] = text.split(' ');
//       const nameConditions = [];
//       if (first) nameConditions.push({ firstName: { like: `%${first}%` } });
//       if (last) nameConditions.push({ lastName: { like: `%${last}%` } });

//       if (nameConditions.length > 1) {
//         orConditions.push({ and: nameConditions });
//       } else if (nameConditions.length === 1) {
//         orConditions.push(nameConditions[0]);
//       }
//     }

//     // Other fields
//     validSortFields.forEach((field) => {
//       if (['id'].includes(field)) {
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

//   // Sorting
//   const orderFilter =
//     validSortFields.includes(orderBy) && order
//       ? [`${orderBy} ${order === 'desc' ? 'DESC' : 'ASC'}`]
//       : undefined;

//   const filter = { skip, limit, order: orderFilter, where };

//   console.log('buildFilter (final):', JSON.stringify(filter, null, 2));
//   return filter;
// }
