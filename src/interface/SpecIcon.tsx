import { Spec } from 'game/SPECS';
import React from 'react';

interface Props extends Omit<React.HTMLAttributes<HTMLImageElement>, 'id'> {
  spec: Spec;
  className?: string;
}

const SpecIcon = ({ spec, className, ...others }: Props) => (
  <img
    src={`/specs/${[spec.className, spec.specName].filter(Boolean).join('-').replace(' ', '')}.jpg`}
    alt={`${spec.specName} ${spec.className}`}
    className={`icon ${className || ''}`}
    {...others}
  />
);

export default SpecIcon;
