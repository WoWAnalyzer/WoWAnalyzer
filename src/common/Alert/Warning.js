import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'Icons/Warning';

import Alert from './index';

const Warning = ({ children, ...others }) => (
  <Alert kind="warning" {...others}>
    <div className="content-middle">
      <div style={{ fontSize: '2em', lineHeight: 1, marginRight: 20 }}>
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
