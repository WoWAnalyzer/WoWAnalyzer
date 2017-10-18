import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ title, children, style }) => (
  <div>
    <div className="panel-body" style={{ padding: '10px 0', ...style }}>
      {children}
    </div>
  </div>
);
Tab.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
};

export default Tab;
