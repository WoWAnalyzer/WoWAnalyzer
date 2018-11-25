import React from 'react';
import PropTypes from 'prop-types';

import { formatPercentage } from 'common/format';

const Ring = ({ size, color, style }) => (
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

const Radar = ({ distance, size, style }) => {
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
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 5,
          height: 5,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#f8b700',
        }}
      />
      <Ring size={10 * pixelsPerYard} style={{ opacity: 1 }} />
      <Ring size={20 * pixelsPerYard} style={{ opacity: 0.75 }} />
      <Ring size={30 * pixelsPerYard} style={{ opacity: 0.5 }} />
      <Ring size={40 * pixelsPerYard} style={{ opacity: 0.25 }} />
      <Ring
        size={distance * pixelsPerYard}
        color="#f8b700"
        style={{
          background: 'rgba(248, 183, 0, 0.3)',
          boxShadow: '0 0 4px #f8b700',
        }}
      />
    </div>
  );
};
Radar.propTypes = {
  distance: PropTypes.number.isRequired,
  size: PropTypes.number,
  style: PropTypes.object,
};
Radar.defaultProps = {
  size: 100,
};

export default Radar;
