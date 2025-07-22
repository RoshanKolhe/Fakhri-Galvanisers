/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-plusplus */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Box,
  Grid,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  TextField,
  Stack,
  Select,
  MenuItem,
  duration,
  IconButton,
  Tooltip,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import { formatTime } from 'src/utils/constants';
import Iconify from 'src/components/iconify';

export default function OrderLotProcessModal({
  open,
  onClose,
  preTreatmentProcesses,
  galvanizingProcesses,
  noOfLots,
  totalQuantity,
  materialName,
  materialId,
  orderId,
  microns,
  customer,
  jobCardLots,
  setJobCardLots,
  handleNoOfLots
}) {
  const { enqueueSnackbar } = useSnackbar();
  const processes = [...preTreatmentProcesses, ...galvanizingProcesses];
  const preCount = preTreatmentProcesses.length;
  const galCount = galvanizingProcesses.length;
  const [lots, setLots] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [times, setTimes] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [bulkTime, setBulkTime] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (Number(noOfLots) >= Number(totalQuantity)) {
      setIsButtonDisabled(true);
    }
  }, [noOfLots]);

  useEffect(() => {
    if (noOfLots <= totalQuantity) {
      initializeLots(noOfLots, totalQuantity, jobCardLots);
    }
  }, [noOfLots, totalQuantity, jobCardLots]);

  const initializeLots = (count, totalQty, existingLots = []) => {
    try {
      const foundMaterial = existingLots.find((res) => res.materialId === materialId);

      if (foundMaterial) {
        const lockedLots = foundMaterial.lots.filter(lot => lot.status !== 0);
        let editableLots = foundMaterial.lots.filter(lot => lot.status === 0);

        const lockedQty = lockedLots.reduce((sum, lot) => sum + Number(lot.quantity), 0);
        const remainingQty = totalQty - lockedQty;

        const totalEditableNeeded = count - lockedLots.length;
        const missingLotsCount = totalEditableNeeded - editableLots.length;

        // Add missing lots if count is higher
        const additionalLots = Array.from({ length: missingLotsCount > 0 ? missingLotsCount : 0 }, (_, i) => ({
          lotNumber: `${editableLots.length + lockedLots.length + i + 1}`,
          quantity: 0,
          filing: '',
          visualInspection: '',
          processes: processes?.map((p) => ({
            processId: p.id,
            duration: p.processesDetails?.duration,
            status: 0,
            timeTaken: null
          })),
          status: 0,
        }));

        editableLots = [...editableLots, ...additionalLots];

        const baseQty = Math.floor(remainingQty / totalEditableNeeded);
        const remainder = remainingQty % totalEditableNeeded;

        const updatedEditableLots = editableLots.map((lot, i) => ({
          ...lot,
          quantity: baseQty + (i < remainder ? 1 : 0),
        }));

        const newLots = [...lockedLots, ...updatedEditableLots].map((lot) => ({
          lotNumber: lot.lotNumber,
          quantity: lot.quantity,
          filing: lot.filing,
          visualInspection: lot.visualInspection,
          processes: lot.processes || [],
          status: lot.status,
        }));
        setLots(newLots);

        const newTimes = [...lockedLots, ...updatedEditableLots].map((lot) => {
          const lotProcesses = lot.processes || [];

          const lotTimesInProcessOrder = processes.map((proc) => {
            const matching = lotProcesses.find((lp) => lp.processId === proc.id);

            return {
              duration: matching?.duration ? new Date(matching.duration) : null,
              status: matching?.status || 0,
              timeTaken: matching?.timeTaken ? new Date(matching.timeTaken) : null,
            };
          });

          return lotTimesInProcessOrder;
        });

        setTimes(newTimes);
      } else {
        // Fresh lot generation logic
        const baseQty = Math.floor(totalQty / count);
        const remainder = totalQty % count;

        const newLots = Array(count)
          .fill(null)
          .map((_, i) => ({
            lotNumber: i + 1,
            quantity: baseQty + (i < remainder ? 1 : 0),
            filing: '',
            visualInspection: '',
            status: 0,
            processes: processes.map((p) => ({
              duration: p.duration ? new Date(p.duration) : null,
              status: 0,
              timeTaken: null,
            })),
          }));

        setLots(newLots);

        const newTimes = Array(count)
          .fill(null)
          .map(() =>
            processes.map((p) => ({
              duration: p.duration ? new Date(p.duration) : null,
              status: 0,
              timeTaken: null,
            }))
          );

        setTimes(newTimes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantityChange = (index, value) => {
    const newLots = [...lots];
    newLots[index].quantity = parseInt(value, 10) || 0;
    setLots(newLots);
  };

  const handleFilingChange = (index, value) => {
    const newLots = [...lots];
    newLots[index].filing = value;
    setLots(newLots);
  };

  const handleVisualInspectionChange = (index, value) => {
    const newLots = [...lots];
    newLots[index].visualInspection = value;
    setLots(newLots);
  };

  const handleTimeChange = (lotIndex, processIndex, newTime) => {
    const updatedTimes = [...times];
    updatedTimes[lotIndex] = [...(updatedTimes[lotIndex] || [])];
    updatedTimes[lotIndex][processIndex].duration = newTime;
    setTimes(updatedTimes);

    // Clear error if a valid time is set
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (newErrors[lotIndex]) {
        delete newErrors[lotIndex][processIndex];
        if (Object.keys(newErrors[lotIndex]).length === 0) {
          delete newErrors[lotIndex]; // Remove lot-level error if empty
        }
      }
      return newErrors;
    });
  };
  const handleRowSelect = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectedProcess = (index) => {
    setSelectedProcesses((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === lots.length) {
      setSelectedRows([]);
    } else {
      const filteredIndexes = lots
        .map((lot, index) => (lot.processes.some((process) => process.status !== 2) ? index : null))
        .filter((index) => index !== null);

      setSelectedRows(filteredIndexes);
    }
  };

  const applyBulkTime = () => {
    if (!bulkTime || selectedRows.length === 0) return;

    const updatedTimes = [...times];

    selectedRows.forEach((lotIndex) => {
      updatedTimes[lotIndex] = [...(updatedTimes[lotIndex] || [])];

      const targetProcesses = selectedProcesses.length > 0
        ? selectedProcesses
        : processes.map((_, index) => index); // apply to all processes if none selected

      targetProcesses.forEach((processIndex) => {
        updatedTimes[lotIndex][processIndex] = {
          ...(updatedTimes[lotIndex][processIndex] || {}),
          duration: bulkTime,
        };
      });
    });

    setTimes(updatedTimes);
  };

  const sumQuantitiesReducer = (total, lot) => total + (lot.quantity || 0);

  const handleSubmit = async () => {
    const newErrors = {};
    let hasErrors = false;

    // Validate times for each lot
    lots.forEach((lot, lotIndex) => {
      processes.forEach((_, processIndex) => {
        if (!times[lotIndex] || !times[lotIndex][processIndex]) {
          hasErrors = true;
          if (!newErrors[lotIndex]) newErrors[lotIndex] = {};
          newErrors[lotIndex][processIndex] = 'Time is required';
        }
      });
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const lotsTotalQuantity = lots.reduce(sumQuantitiesReducer, 0);
    if (lotsTotalQuantity !== totalQuantity) {
      enqueueSnackbar('Lots Total Quantity Should match Material Total Quantity', {
        variant: 'error',
      });
      return;
    }
    const submissionData = lots.map((lot, index) => ({
      lotNumber: lot.lotNumber,
      quantity: lot.quantity,
      filing: lot.filing,
      visualInspection: lot.visualInspection,
      status: lot.status,
      galvanizingProcesses:
        times[index]?.map((process, processIndex) => ({
          processId: processes[processIndex].id,
          duration: process.duration,
          timeTaken: process?.timeTaken ? process.timeTaken : null,
          status: process?.processesDetails?.status ? process?.processesDetails?.status : 0,
        })) || [],
      preTreatmentProcesses:
        times[index]?.map((process, processIndex) => ({
          processId: processes[processIndex].id,
          duration: process.duration,
          timeTaken: process?.timeTaken ? process.timeTaken : null,
          status: process?.processesDetails?.status ? process?.processesDetails?.status : 0,
        })) || [],
      processes: times[index]?.map((process, processIndex) => ({
        processId: processes[processIndex].id,
        duration: process.duration,
        timeTaken: process?.timeTaken ? process.timeTaken : null,
        status: process?.processesDetails?.status ? process?.processesDetails?.status : 0,
      })) || [],
    }));

    // Check if materialId; already exists in jobCardLots
    const existingJobCardLotIndex = jobCardLots.findIndex((lot) => lot.materialId === materialId);

    if (existingJobCardLotIndex >= 0) {
      // If materialId exists, update the existing entry
      const updatedJobCardLots = [...jobCardLots];
      updatedJobCardLots[existingJobCardLotIndex] = {
        materialId,
        lots: submissionData,
      };
      setJobCardLots(updatedJobCardLots);
    } else {
      // If materialId doesn't exist, add new entry
      setJobCardLots((prevLots) => [...prevLots, { materialId, lots: submissionData }]);
    }
    handleNoOfLots(materialId, lots.length)

    onClose();
  };

  const getFontColor = (process) => {
    if (!process?.duration || !process?.timeTaken) {
      return 'gray'; // Default color if values are missing
    }

    const durationTime = new Date(process.duration).getMinutes();
    const timeTakenTime = new Date(process.timeTaken).getMinutes();

    if (timeTakenTime > durationTime) {
      return 'red'; // Time taken is greater than duration
    }
    if (timeTakenTime < durationTime) {
      return 'yellow'; // Time taken is less than duration
    }
    return 'green'; // Time taken is equal to duration
  };

  const handleDelteLot = (lotIndex) => {
    const newLots = lots.filter((_, index) => index !== lotIndex);
    setLots(newLots);

    // Update 'times'
    const newTimes = times.filter((_, index) => index !== lotIndex);
    setTimes(newTimes);

    // // Update 'errors'
    // const newErrors = errors.filter((_, index) => index !== lotIndex);
    // setErrors(newErrors);

    // // Update 'selectedRows'
    // const newSelectedRows = selectedRows
    //   .filter(index => index !== lotIndex)
    //   .map(index => (index > lotIndex ? index - 1 : index)); // Adjust remaining indexes
    // setSelectedRows(newSelectedRows);

    // console.log(newLots.length);
    // handleNoOfLots(materialId, newLots.length);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'white',
          p: 4,
          boxShadow: 24,
          borderRadius: 2,
          height: '600px',
          overflowY: 'auto',
        }}
      >
        <Grid container>
          {orderId !== 'NA' && <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Order Id:</strong> {orderId}
            </Typography>
          </Grid>}
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Customer:</strong> {customer?.firstName} {customer?.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Material:</strong> {materialName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Microns:</strong> {microns}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Total Quantity:</strong> {totalQuantity}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>No of Lots:</strong> {noOfLots}
            </Typography>
          </Grid>
        </Grid>

        {(selectedRows.length > 0 || selectedProcesses.length > 0) && (
          <Grid
            container
            spacing={2}
            sx={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              marginTop: '15px',
              borderRadius: '5px',
            }}
          >
            <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1">Apply Bulk Time:</Typography>
            </Grid>
            <Grid item xs={4}>
              <TimePicker
                value={bulkTime}
                onChange={(newTime) => setBulkTime(newTime)}
                views={['minutes', 'seconds']}
                format="mm:ss"
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="contained" color="primary" onClick={applyBulkTime}>
                Apply to Selected
              </Button>
            </Grid>
          </Grid>
        )}

        <TableContainer sx={{ maxHeight: 400, marginTop: '20px' }}>
          <Table stickyHeader>
            <TableHead>
              {/* First Header Row: Grouping */}
              <TableRow>
                <TableCell rowSpan={2}>
                  <Checkbox
                    checked={selectedRows.length === lots.length && lots.length > 0}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < lots.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell rowSpan={2}>Lot</TableCell>

                {preCount > 0 && (
                  <TableCell colSpan={preCount} align="center" sx={{ backgroundColor: '#e3f2fd' }}>
                    Pre-Treatment
                  </TableCell>
                )}
                {galCount > 0 && (
                  <TableCell colSpan={galCount} align="center" sx={{ backgroundColor: '#fbe9e7' }}>
                    Galvanizing
                  </TableCell>
                )}

                <TableCell rowSpan={2}>Quantity</TableCell>
                <TableCell rowSpan={2}>Filing</TableCell>
                <TableCell rowSpan={2}>Visual Inspection</TableCell>
                <TableCell rowSpan={2}>Actions</TableCell>
              </TableRow>

              {/* Second Header Row: Individual Process Names */}
              <TableRow>
                {processes.map((process, index) => (
                  <TableCell
                    key={`pre-${index}`}
                    sx={{ backgroundColor: '#e3f2fd', textAlign: 'center' }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Checkbox
                        checked={process.checked}
                        onChange={() => handleSelectedProcess(index)}
                        size="small"
                      />
                      {process.name}
                    </Box>
                  </TableCell>
                ))}
                {/* {galvanizingProcesses.map((process, index) => (
                  <TableCell
                    key={`gal-${index}`}
                    sx={{ backgroundColor: '#fbe9e7', textAlign: 'center' }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Checkbox
                        checked={process.checked}
                        onChange={() => handleSelectedProcess(index)}
                        size="small"
                      />
                      {process.name}
                    </Box>
                  </TableCell>
                ))} */}
              </TableRow>

            </TableHead>
            <TableBody>
              {lots.map((lot, lotIndex) => (
                <TableRow key={lotIndex}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(lotIndex)}
                      onChange={() => handleRowSelect(lotIndex)}
                      disabled={lot.status !== 0}
                    />
                  </TableCell>
                  <TableCell>{`Lot${lot.lotNumber}`}</TableCell>
                  {processes.map((process, processIndex) => (
                    <TableCell key={processIndex}>
                      {times[lotIndex]?.[processIndex]?.status === 1 ? (
                        <TimePicker
                          value={times[lotIndex]?.[processIndex].duration || null}
                          onChange={(newTime) => handleTimeChange(lotIndex, processIndex, newTime)}
                          views={['minutes', 'seconds']}
                          format="mm:ss"
                          renderInput={(params) => <TextField {...params} />}
                          slotProps={{
                            textField: {
                              error: Boolean(errors?.[lotIndex]?.[processIndex]),
                              helperText: errors?.[lotIndex]?.[processIndex] || '',
                            },
                          }}
                          sx={{ minWidth: '140px' }}
                          disabled
                        />
                      ) : times[lotIndex]?.[processIndex]?.status === 2 ? (
                        <Stack direction="column" spacing={1}>
                          {/* Duration Time */}
                          <Typography variant="body2" color="textSecondary">
                            Duration:{' '}
                            <strong>{formatTime(times[lotIndex]?.[processIndex]?.duration)}</strong>
                          </Typography>

                          {/* Time Taken with Dynamic Color */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: getFontColor(times[lotIndex]?.[processIndex]),
                              fontWeight: 'bold',
                            }}
                          >
                            Time Taken:{' '}
                            <strong>
                              {formatTime(times[lotIndex]?.[processIndex]?.timeTaken)}
                            </strong>
                          </Typography>
                        </Stack>
                      ) : (
                        <TimePicker
                          value={times[lotIndex]?.[processIndex]?.duration || null}
                          onChange={(newTime) => handleTimeChange(lotIndex, processIndex, newTime)}
                          views={['minutes', 'seconds']}
                          format="mm:ss"
                          renderInput={(params) => <TextField {...params} />}
                          slotProps={{
                            textField: {
                              error: Boolean(errors?.[lotIndex]?.[processIndex]),
                              helperText: errors?.[lotIndex]?.[processIndex] || '',
                            },
                          }}
                          sx={{ minWidth: '140px' }}
                        />
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <TextField
                      type="number"
                      value={lot.quantity}
                      onChange={(e) => handleQuantityChange(lotIndex, e.target.value)}
                      disabled={lot.status !== 0}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lot?.filing || ''}
                      onChange={(e) => handleFilingChange(lotIndex, e.target.value)}
                      displayEmpty
                      disabled={lot.status !== 0}
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>
                      <MenuItem value="OK">OK</MenuItem>
                      <MenuItem value="Not OK">Not OK</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lot?.visualInspection || ''}
                      onChange={(e) => handleVisualInspectionChange(lotIndex, e.target.value)}
                      disabled={lot.status !== 0}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>
                      <MenuItem value="OK">OK</MenuItem>
                      <MenuItem value="Not OK">Not OK</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelteLot(lotIndex)}>
                      <Tooltip title="Delete lot">
                        <Iconify color='red' icon="solar:trash-bin-trash-bold" />
                      </Tooltip>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack spacing={1} direction='row'>
          <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleSubmit}>
            Submit
          </Button>
          <Button disabled={!!isButtonDisabled} variant="contained" sx={{ mt: 2, ml: 2 }} onClick={() => handleNoOfLots(materialId, Number(noOfLots) + 1)}>
            + Add lot
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

OrderLotProcessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  galvanizingProcesses: PropTypes.arrayOf(PropTypes.object).isRequired,
  preTreatmentProcesses: PropTypes.arrayOf(PropTypes.object).isRequired,
  noOfLots: PropTypes.number.isRequired,
  totalQuantity: PropTypes.number.isRequired,
  materialName: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  materialId: PropTypes.number.isRequired,
  microns: PropTypes.number.isRequired,
  customer: PropTypes.object.isRequired,
  jobCardLots: PropTypes.array,
  setJobCardLots: PropTypes.func,
  handleNoOfLots: PropTypes.func,
};
