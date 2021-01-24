import React from 'react';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  kind: 'danger' | 'warning' | 'info';
}

const Alert = ({ kind, children, className, ...otherProps }: Props) => (
  <div className={`alert alert-${kind} ${className || ''}`} {...otherProps}>
    {children}
  </div>
);

export default Alert;
