import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'Icons/Warning';

import Alert from './index';

const Warning = ({ children, ...others }) => (
  <Alert kind="warning" {...others}>
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
Warning.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Warning;
