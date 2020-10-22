/**
 * A simple component that shows the resource icon left and a value right.
 */
import React from 'react';

import ResourceIcon from 'common/ResourceIcon';

import '../BoringValue.scss';

interface Resource {
  id: number;
}

type Props = {
  resource: Resource;
  value: React.ReactNode;
  label: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

const BoringResourceValue = ({ resource, value, label, extra, className }: Props) => (
  <div className={`flex boring-value ${className || ''}`}>
    <div className="flex-sub icon">
      <ResourceIcon id={resource.id} />
    </div>
    <div className="flex-main value">
      <div>{value}</div>
      <small>{label}</small>
      {extra}
    </div>
  </div>
);

export default BoringResourceValue;
