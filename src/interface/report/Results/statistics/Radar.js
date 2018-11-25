import React from 'react';
import PropTypes from 'prop-types';

import { formatNumber } from 'common/format';

const Ring = ({ size, color, style, ...others }) => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: size,
      height: size,
      border: `2px solid ${color}`,
      borderRadius: '50%',
      ...style,
    }}
    {...others}
  />
);
Ring.propTypes = {
  size: PropTypes.number.isRequired,
  color: PropTypes.string,
  style: PropTypes.object,
};
Ring.defaultProps = {
  color: '#9c9c9c',
};

const Radar = ({ distance, size, style, playerColor }) => {
  const pixelsPerYard = size / 40;
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        ...style,
      }}
    >
      <Ring size={40 * pixelsPerYard} style={{ opacity: 0.25, background: 'rgba(255, 255, 255, 0.05)' }} data-tip="30-40 yards" />
      <Ring size={30 * pixelsPerYard} style={{ opacity: 0.5 }} data-tip="20-30 yards" />
      <Ring size={20 * pixelsPerYard} style={{ opacity: 0.75 }} data-tip="10-20 yards" />
      <Ring size={10 * pixelsPerYard} style={{ opacity: 1 }} data-tip="0-10 yards" />
      <Ring
        size={distance * pixelsPerYard}
        data-tip={`${formatNumber(distance)} yards`}
        color="#f8b700"
        style={{
          background: 'rgba(248, 183, 0, 0.3)',
          boxShadow: '0 0 4px #f8b700',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 5,
          height: 5,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: playerColor,
        }}
      />
    </div>
  );
};
Radar.propTypes = {
  distance: PropTypes.number.isRequired,
  size: PropTypes.number,
  style: PropTypes.object,
  playerColor: PropTypes.string,
};
Radar.defaultProps = {
  size: 100,
  playerColor: '#f8b700',
};

export default Radar;
