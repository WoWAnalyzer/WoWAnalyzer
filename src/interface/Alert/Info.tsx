import React from 'react';

import Icon from 'interface/icons/Information';

import Alert, { Props as AlertProps } from './index';

type Props = Omit<AlertProps, 'kind'>;

const Info = ({ children, ...otherProps }: Props) => (
  <Alert kind="info" {...otherProps}>
    <div className="content-middle">
      <div className="icon-container">
        <Icon />
      </div>
      <div>{children}</div>
    </div>
  </Alert>
);

export default Info;
