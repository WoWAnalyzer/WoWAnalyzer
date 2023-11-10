import { formatNumber } from 'common/format';
import { Tooltip } from 'interface';
import { CSSProperties } from 'react';

import DistanceRadarRing from './DistanceRadarRing';

const Radar = ({ distance, size = 100, style, playerColor = '#f8b700' }: Props) => {
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
      <DistanceRadarRing
        size={40 * pixelsPerYard}
        style={{ opacity: 0.25, background: 'rgba(255, 255, 255, 0.05)' }}
      />
      <DistanceRadarRing size={30 * pixelsPerYard} style={{ opacity: 0.5 }} />
      <DistanceRadarRing size={20 * pixelsPerYard} style={{ opacity: 0.75 }} />
      <DistanceRadarRing size={10 * pixelsPerYard} style={{ opacity: 1 }} />
      <Tooltip content={`${formatNumber(distance)} yards`}>
        <DistanceRadarRing
          size={distance * pixelsPerYard}
          color="#f8b700"
          style={{
            background: 'rgba(248, 183, 0, 0.3)',
            boxShadow: '0 0 4px #f8b700',
          }}
        />
      </Tooltip>
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
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

interface Props {
  distance: number;
  size?: number;
  style?: CSSProperties;
  playerColor?: string;
}

export default Radar;
