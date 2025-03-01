import PropTypes from 'prop-types';
// @mui
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
// utils
import { fDateTime } from 'src/utils/format-time';
import { ORDER_STATUS_OPTIONS } from 'src/utils/constants';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export default function AnalyticsOrderTimeline({ title, history = [], subheader, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Timeline
        sx={{
          m: 0,
          p: 3,
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
    </Card>
  );
}

AnalyticsOrderTimeline.propTypes = {
  history: PropTypes.array,
  subheader: PropTypes.string,
  title: PropTypes.string,
};
