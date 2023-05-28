/**
 * A simple component that shows the resource icon left and a value right.
 */
import { ResourceIcon } from 'interface';
import * as React from 'react';

import './BoringValue.scss';

interface Resource {
  id: number;
  [others: string]: any;
}

type Props = {
  resource: Resource;
  value: React.ReactNode;
  label: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
};

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
