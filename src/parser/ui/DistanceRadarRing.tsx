import { CSSProperties } from '@emotion/serialize';
import React, { LegacyRef } from 'react';

type Props = {
  size: number;
  color?: string;
  style?: CSSProperties;
  innerRef?: LegacyRef<HTMLDivElement>;
} & React.ComponentProps<'div'>;

const DistanceRadarRing = ({ innerRef, size, color = '#9c9c9c', style, ...others }: Props) => (
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
    ref={innerRef}
    {...others}
  />
);

export default DistanceRadarRing;
