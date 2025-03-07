import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
//
import { fileData, fileFormat, fileThumb } from './utils';
import DownloadButton from './download-button';

// ----------------------------------------------------------------------

export default function FileThumbnail({ file, tooltip, imageView, onDownload, sx, imgSx }) {
  const { name = '', path = '', preview = '' } = fileData(file);

  const format = fileFormat(path || preview);

  const isValidUrl = (str) => {
    try {
      // eslint-disable-next-line no-new
      new URL(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  const renderContent =
    format === 'image' && imageView ? (
      <Box
        component="img"
        src={preview}
        sx={{
          width: 1,
          height: 1,
          flexShrink: 0,
          objectFit: 'cover',
          ...imgSx,
          cursor: isValidUrl(file) ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (isValidUrl(file)) {
            window.open(file, '_blank'); // Open URL in a new tab
          }
        }}
      />
    ) : (
      <Box
        component="img"
        src={fileThumb(format)}
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          ...sx,
          cursor: isValidUrl(file) ? 'pointer' : 'default',
        }}
        onClick={() => {
          console.log('here', isValidUrl(file));
          if (isValidUrl(file)) {
            window.open(file, '_blank'); // Open URL in a new tab
          }
        }}
      />
    );

  if (tooltip) {
    return (
      <Tooltip title={name}>
        <Stack
          flexShrink={0}
          component="span"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 'fit-content',
            height: 'inherit',
          }}
        >
          {renderContent}
          {onDownload && <DownloadButton onDownload={onDownload} />}
        </Stack>
      </Tooltip>
    );
  }

  return (
    <>
      {renderContent}
      {onDownload && <DownloadButton onDownload={onDownload} />}
    </>
  );
}

FileThumbnail.propTypes = {
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  imageView: PropTypes.bool,
  imgSx: PropTypes.object,
  onDownload: PropTypes.func,
  sx: PropTypes.object,
  tooltip: PropTypes.bool,
};
