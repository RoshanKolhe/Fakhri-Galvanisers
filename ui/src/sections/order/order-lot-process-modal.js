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
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import { formatTime } from 'src/utils/constants';

export default function OrderLotProcessModal({
  open,
  onClose,
  processes,
  noOfLots,
  totalQuantity,
  materialName,
  materialId,
  orderId,
  microns,
  customer,
  jobCardLots,
  setJobCardLots,
}) {
  console.log(jobCardLots);
  const { enqueueSnackbar } = useSnackbar();
  const [lots, setLots] = useState([]);
  console.log('lots', lots);
  const [times, setTimes] = useState([]);
  console.log('times', times);

  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkTime, setBulkTime] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    initializeLots(noOfLots, totalQuantity, jobCardLots);
  }, [noOfLots, totalQuantity, jobCardLots]);

  const initializeLots = (count, totalQty, existingLots = []) => {
    try {
      console.log(existingLots.length);
      const foundMaterial = existingLots.find((res) => res.materialId === materialId);

      if (foundMaterial && foundMaterial.lots.length > 0) {
        // Use existing lots data if available
        const newLots = foundMaterial.lots.map((lot) => ({
          lotNumber: lot.lotNumber,
          quantity: lot.quantity,
          processes: lot.processes || [],
          status: lot.status,
        }));

        setLots(newLots);

        // Ensure `times` is properly initialized with process details
        const newTimes = foundMaterial.lots.map((lot) =>
          lot.processes.map((process) => ({
            duration: process.duration ? new Date(process.duration) : null,
            status: process.status || 0,
            timeTaken: process.timeTaken ? new Date(process.timeTaken) : null,
          }))
        );

        setTimes(newTimes);
      } else {
        console.log('here');
        const baseQty = Math.floor(totalQty / count);
        const remainder = totalQty % count;

        const newLots = Array(count)
          .fill(null)
          .map((_, i) => ({
            lotNumber: i + 1,
            quantity: baseQty + (i < remainder ? 1 : 0),
            status: 0,
            processes: processes.map(() => ({
              duration: null,
              status: 0,
              timeTaken: null,
            })), // Initialize processes properly
          }));

        setLots(newLots);

        // Ensure `times` matches `processes` structure
        const newTimes = Array(count)
          .fill(null)
          .map(() =>
            processes.map(() => ({
              duration: null,
              status: 0,
              timeTaken: null,
            }))
          );

        setTimes(newTimes);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleQuantityChange = (index, value) => {
    const newLots = [...lots];
    newLots[index].quantity = parseInt(value, 10) || 0;
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
    if (!bulkTime) return;

    const updatedTimes = [...times];

    selectedRows.forEach((lotIndex) => {
      // Ensure the lot has an array to store process times
      updatedTimes[lotIndex] = [...(updatedTimes[lotIndex] || [])];

      processes.forEach((_, processIndex) => {
        // Ensure each process entry exists before modifying
        updatedTimes[lotIndex][processIndex] = {
          ...(updatedTimes[lotIndex][processIndex] || {}),
          duration: bulkTime, // Apply only the duration field
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
      status: lot.status,
      processes:
        times[index]?.map((process, processIndex) => ({
          processId: processes[processIndex].id,
          duration: process.duration,
          timeTaken: process?.timeTaken ? process.timeTaken : null,
          status: process?.status ? process.status : 0,
        })) || [],
    }));
    console.log('submissionData', submissionData);
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

    onClose();
  };
  console.log('processes', processes);

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
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Order Id:</strong> {orderId}
            </Typography>
          </Grid>
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

        {selectedRows.length > 0 && (
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
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.length === lots.length && lots.length > 0}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < lots.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell>Lot</TableCell>
                {processes.map((process, index) => (
                  <TableCell key={index}>{process.name}</TableCell>
                ))}
                <TableCell>Quantity</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
}

OrderLotProcessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  processes: PropTypes.arrayOf(PropTypes.object).isRequired,
  noOfLots: PropTypes.number.isRequired,
  totalQuantity: PropTypes.number.isRequired,
  materialName: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  materialId: PropTypes.number.isRequired,
  microns: PropTypes.number.isRequired,
  customer: PropTypes.object.isRequired,
  jobCardLots: PropTypes.array,
  setJobCardLots: PropTypes.func,
};
