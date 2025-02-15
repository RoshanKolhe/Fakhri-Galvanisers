/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
// @mui
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// utils
import { fDateTime } from 'src/utils/format-time';
import { ORDER_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function OrderDetailsHistory({ history = [], order }) {
  const renderSummary = (
    <Stack
      spacing={2}
      component={Paper}
      variant="outlined"
      sx={{
        p: 2.5,
        minWidth: 260,
        flexShrink: 0,
        borderRadius: 2,
        typography: 'body2',
        borderStyle: 'dashed',
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Order time</Box>
        {order && fDateTime(order?.createdAt)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Payment time</Box>
        {order && fDateTime(order?.createdAt)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>Completion time</Box>
        {order && fDateTime(order?.createdAt)}
      </Stack>
    </Stack>
  );

  const renderTimeline = (
    <Timeline
      sx={{
        p: 0,
        m: 0,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {ORDER_STATUS_OPTIONS.map((status, index) => {
        const timelineStep = history && history.find((step) => step.id === status.value);
        const isCompleted = timelineStep !== undefined;
        const isCurrentStep = isCompleted && index === history.length - 1;
  
        let color = 'grey';
  
        if (isCompleted || isCurrentStep) {
          color = 'success';
        } 
  
        return (
          <TimelineItem key={status.value}>
            <TimelineSeparator>
              <TimelineDot color={color} />
              {index !== ORDER_STATUS_OPTIONS.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
  
            <TimelineContent>
              <Typography variant="subtitle2" fontWeight={isCurrentStep ? 'bold' : 'normal'}>
                {status.label}
              </Typography>
              <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                {timelineStep ? new Date(timelineStep.time).toLocaleString() : ''}
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
  

  return (
    <Card>
      <CardHeader title="Status" />
      <Stack
        spacing={3}
        alignItems={{ md: 'flex-start' }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderTimeline}

        {renderSummary}
      </Stack>
    </Card>
  );
}

OrderDetailsHistory.propTypes = {
  history: PropTypes.array,
  order: PropTypes.object,
};
