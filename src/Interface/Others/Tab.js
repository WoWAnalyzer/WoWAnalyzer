import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ children, style }) => (
  <div style={{ padding: '10px 0', ...style }}>
    {children}
  </div>
);
Tab.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export default Tab;
