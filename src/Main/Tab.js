import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ children, style }) => (
  <div className="panel-body" style={{ padding: '10px 0', ...style }}>
    {children}
  </div>
);
Tab.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
};

export default Tab;
