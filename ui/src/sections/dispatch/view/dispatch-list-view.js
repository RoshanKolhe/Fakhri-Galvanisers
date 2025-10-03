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
import { useGetCustomersWithFilter } from 'src/api/customer';
import { useGetOrdersWithFilter } from 'src/api/order';

import { buildFilter } from 'src/utils/filters';
import { useGetDispatches } from 'src/api/dispatch';
import { DISPATCH_STATUS_OPTIONS } from 'src/utils/constants';
import DispatchTableToolbar from '../dispatch-table-toolbar';
import DispatchTableFiltersResult from '../dispatch-table-filters-result';
import DispatchTableRow from '../dispatch-table-row';


// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...DISPATCH_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'id', label: 'Dispatch ID', width: 116 },
  { id: 'order.id', label: 'Order ID' },
  { id: 'customer.firstName', label: 'Customer Name' },
  { id: 'status', label: 'Status', width: 110 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  additionalConditions:{
    customerId:[],
    orderId:[]

  }
};

// ----------------------------------------------------------------------

export default function DispatchListView() {
  const [quickEditRow, setQuickEditRow] = useState();

  const quickEdit = useBoolean();

  const table = useTable({ defaultDispatchBy: 'id' });

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
    validSortFields: ['id'],
    searchTextValue: filters.name,
    status: filters.status,
    additionalWhereOrConditions: [
      { customerId: filters.additionalConditions.customerId.length > 0 ? { inq: filters.additionalConditions.customerId } : null },
      { orderId: filters.additionalConditions.orderId.length > 0 ? { inq: filters.additionalConditions.orderId } : null },
    ].filter(Boolean),
    combineName: true,
  })

  const { dispatches,totalcount, dispatchesLoading, dispatchesEmpty, refreshDispatches } = useGetDispatches(filter);
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
  
      const orderFIlter= {
        where: {
            orderId: { like: `%${filters.name.trim() || ''}%`, options: 'i' },
        },
        limit: 20,
        fields: { id: true }
      };
      const { filteredOrders, filteredOrdersEmpty } = useGetOrdersWithFilter(encodeURIComponent(JSON.stringify(orderFIlter)));
    
      useEffect(() => {
        if (filteredOrders.length > 0 && !filteredOrdersEmpty && filters.name.length > 3) {
          console.table(filteredOrders);
          const ids = filteredOrders.map((order) => order.id);
          filters.additionalConditions.orderId = ids || [];
        } else {
          filters.additionalConditions.orderId = [];
        }
      }, [filteredOrders, filteredOrdersEmpty, filters]);
    
      console.log(filter);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.qcReport, table.qcReportBy),
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

  const notFound = (!dispatches.length && canReset) || !dispatches.length;

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

      table.onUpdatePageDeleteRow(dispatches.length);
    },
    [dispatches.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dispatches.length,
      totalRowsFiltered: dispatches.length,
    });
  }, [dispatches.length, table, tableData]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.dispatch.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.dispatch.view(id));
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
    if (dispatches) {
      setTableData(dispatches);
    }
  }, [dispatches]);

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
              name: 'Dispatch',
              href: paths.dashboard.dispatch.root,
            },
            { name: 'List' },
          ]}
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
                      (tab.value === 0 && 'warning') ||
                      (tab.value === 1 && 'info') || // 'info' for "Documents Uploaded"
                      (tab.value === 2 && 'success') || // 'success' for "Completed"
                      'default'
                    }
                  >
                    {tab.value === 'all' && totalcount.total}
                    {tab.value === 0 &&
                      totalcount.pendingTotal}
                    {tab.value === 1 &&
                      totalcount.documentsUploadedTotal}
                    {tab.value === 2 &&
                      totalcount.completedTotal}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <DispatchTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />

          {canReset && (
            <DispatchTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dispatches.length}
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
                  qcReport={table.qcReport}
                  qcReportBy={table.qcReportBy}
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
                  {dispatches
                  
                    .map((row) => (
                      <DispatchTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
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

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const dispatch = comparator(a[0], b[0]);
    if (dispatch !== 0) return dispatch;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((dispatch) => deepSearch(dispatch, name));
  }

  if (status !== 'all') {
    inputData = inputData.filter((dispatch) => dispatch.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (dispatch) =>
          fTimestamp(dispatch.createdAt) >= fTimestamp(startDate) &&
          fTimestamp(dispatch.createdAt) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}

const deepSearch = (data, searchTerm) => {
  if (typeof data === 'string') {
    return data.toLowerCase().includes(searchTerm.toLowerCase());
  }

  if (Array.isArray(data)) {
    return data.some((item) => deepSearch(item, searchTerm));
  }

  if (typeof data === 'object' && data !== null) {
    return Object.values(data).some((value) => deepSearch(value, searchTerm));
  }

  return false;
};
