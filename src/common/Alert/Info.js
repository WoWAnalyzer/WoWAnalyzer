import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'Icons/Information';

import Alert from './index';

const Info = ({ children, ...others }) => (
  <Alert kind="info" {...others}>
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
Info.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Info;
