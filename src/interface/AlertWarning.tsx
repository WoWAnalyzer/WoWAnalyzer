import React from 'react';

import Icon from 'interface/icons/Warning';

import Alert, { Props as AlertProps } from './Alert';

type Props = Omit<AlertProps, 'kind'>;

const AlertWarning = ({ children, ...otherProps }: Props) => (
  <Alert kind="warning" {...otherProps}>
    <div className="content-middle">
      <div className="icon-container">
        <Icon />
      </div>
      <div>{children}</div>
    </div>
  </Alert>
);

export default AlertWarning;
