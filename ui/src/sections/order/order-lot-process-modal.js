/* eslint-disable no-plusplus */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { TimePicker } from '@mui/x-date-pickers';

export default function OrderLotProcessModal({
  open,
  onClose,
  processes,
  noOfLots,
  totalQuantity,
  materialName,
  orderId,
  microns,
}) {
  console.log(processes);
  const [times, setTimes] = useState(Array(processes.length).fill('')); // Store the time inputs for each process
  const [lots, setLots] = useState([]);

  // Divide total quantity into equal lots, handling odd remainders
  useEffect(() => {
    const baseQuantity = Math.floor(totalQuantity / noOfLots);
    const remainder = totalQuantity % noOfLots;

    const lotArray = Array(noOfLots).fill(baseQuantity);
    for (let i = 0; i < remainder; i++) {
      lotArray[i] += 1;
    }

    setLots(lotArray);
  }, [noOfLots, totalQuantity]);

  const handleTimeChange = (lotIndex, processIndex, newTime) => {
    const updatedTimes = [...times];
    if (!updatedTimes[lotIndex]) updatedTimes[lotIndex] = [];
    updatedTimes[lotIndex][processIndex] = newTime;
    setTimes(updatedTimes);
  };

  const handleSubmit = () => {
    if (times.every((time) => time)) {
      // Submit logic here
      console.log('Submitting...', times);
    }
  };

  const isSubmitDisabled = times.includes('');

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
        }}
      >
        <Typography variant="h6" gutterBottom>
          Material Details: {materialName} (Order ID: {orderId})
        </Typography>
        <Typography variant="body1" gutterBottom>
          Microns: {microns}
        </Typography>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Lot</TableCell>
                {processes.map((process, index) => (
                  <TableCell key={index}>{process.name}</TableCell>
                ))}
                <TableCell>Quantity</TableCell>
                <TableCell>Microns</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lots.map((lot, lotIndex) => (
                <TableRow key={lotIndex}>
                  <TableCell>{`Lot ${lotIndex + 1}`}</TableCell>
                  {processes.map((process, processIndex) => (
                    <TableCell key={processIndex}>
                      <TimePicker
                        value={times[lotIndex]?.[processIndex] || null}
                        onChange={(newTime) => handleTimeChange(lotIndex, processIndex, newTime)}
                        views={['minutes', 'seconds']}
                        format="mm:ss"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            sx={{
                              input: {
                                padding: 0,
                                textAlign: 'center',
                                border: 'none',
                              },
                              '.MuiOutlinedInput-root': {
                                '& fieldset': { display: 'none' },
                              },
                              '.MuiSvgIcon-root': { display: 'none' },
                            }}
                          />
                        )}
                      />
                    </TableCell>
                  ))}
                  <TableCell>{lot}</TableCell>
                  <TableCell>{microns}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
}

OrderLotProcessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  processes: PropTypes.arrayOf(PropTypes.string).isRequired,
  noOfLots: PropTypes.number.isRequired,
  totalQuantity: PropTypes.number.isRequired,
  materialName: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  microns: PropTypes.number.isRequired,
};
