import React from 'react';

import SPECS from 'game/SPECS';

interface Props extends Omit<React.HTMLAttributes<HTMLImageElement>, 'id'> {
  id: number
  className?: string
}

const SpecIcon = ({ id, className, ...others }: Props) => {
  if (!SPECS[id]) {
    throw new Error(`Unknown spec: ${id}`);
  }

  const spec = SPECS[id];

  return (
    <img
      src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`}
      alt={`${spec.specName} ${spec.className}`}
      className={`icon ${className || ''}`}
      {...others}
    />
  );
};

export default SpecIcon;
