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

  const { quotations, quotationsLoading, quotationsEmpty, refreshQuotations } = useGetQuotations();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

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
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

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
                    {tab.value === 'all' && quotations.length}
                    {tab.value === 1 &&
                      quotations.filter((quotation) => quotation.status === 1).length}

                    {tab.value === 2 &&
                      quotations.filter((quotation) => quotation.status === 2).length}
                    {tab.value === 3 &&
                      quotations.filter((quotation) => quotation.status === 3).length}
                    {tab.value === 4 &&
                      quotations.filter((quotation) => quotation.status === 4).length}
                    {tab.value === 0 &&
                      quotations.filter((quotation) => quotation.status === 0).length}
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
              results={dataFiltered.length}
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
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
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
            count={dataFiltered.length}
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

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  const roleMapping = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    worker: 'Worker',
    qc_Admin: 'Qc Admin',
  };
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((quotation) =>
      Object.values(quotation).some((value) =>
        String(value).toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((quotation) =>
      status === '1' ? quotation.isActive : !quotation.isActive
    );
  }

  if (role.length) {
    inputData = inputData.filter(
      (quotation) =>
        quotation.permissions &&
        quotation.permissions.some((quotationRole) => {
          console.log(quotationRole);
          const mappedRole = roleMapping[quotationRole];
          console.log('Mapped Role:', mappedRole); // Check the mapped role
          return mappedRole && role.includes(mappedRole);
        })
    );
  }

  return inputData;
}
