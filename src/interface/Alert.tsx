import * as React from 'react';

import AlertDanger from './AlertDanger';
import AlertInfo from './AlertInfo';
import AlertWarning from './AlertWarning';

export type AlertKind = 'danger' | 'warning' | 'info';
export const getAlertComponent = (type: AlertKind) => {
  switch (type) {
    case 'info':
      return AlertInfo;
    case 'warning':
      return AlertWarning;
    case 'danger':
      return AlertDanger;
  }
};

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  kind: AlertKind;
}

const Alert = ({ kind, children, className, ...otherProps }: Props) => (
  <div className={`alert alert-${kind} ${className || ''}`} {...otherProps}>
    {children}
  </div>
);

export default Alert;
