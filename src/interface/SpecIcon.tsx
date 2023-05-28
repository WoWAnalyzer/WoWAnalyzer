import { Spec } from 'game/SPECS';
import * as React from 'react';

interface Props extends Omit<React.HTMLAttributes<HTMLImageElement>, 'id'> {
  spec?: Spec;
  icon?: string;
  className?: string;
}

const SpecIcon = ({ spec, icon, className, ...others }: Props) => (
  <img
    src={`/specs/${
      spec ? [spec.className, spec.specName].filter(Boolean).join('-').replace(' ', '') : icon
    }.jpg`}
    alt={spec ? `${spec.specName} ${spec.className}` : icon}
    className={`icon ${className || ''}`}
    {...others}
  />
);

export default SpecIcon;
