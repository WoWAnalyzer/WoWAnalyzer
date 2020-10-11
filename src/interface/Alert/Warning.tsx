import React from 'react';

import Icon from 'interface/icons/Warning';

import Alert, { Props as AlertProps } from './index';

type Props = Omit<AlertProps, 'kind'>

const Warning = ({ children, ...otherProps }: Props) => (
  <Alert kind="warning" {...otherProps}>
    <div className="content-middle">
      <div className="icon-container">
        <Icon />
      </div>
      <div>
        {children}
      </div>
    </div>
  </Alert>
);

export default Warning;
