import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'Icons/Warning';

import Alert from './index';

const Danger = ({ children, ...others }) => (
  <Alert kind="danger" {...others}>
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
Danger.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Danger;
