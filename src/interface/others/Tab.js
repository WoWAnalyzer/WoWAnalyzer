import React from 'react';
import PropTypes from 'prop-types';

const Tab = ({ children, title, explanation, style }) => (
  <div className="panel" style={style}>
    <div className="panel-heading">
      <h1>{title}</h1>
      {explanation && <small>{explanation}</small>}
    </div>
    <div className="panel-body pad">
      {children}
    </div>
  </div>
);
Tab.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  explanation: PropTypes.node,
  style: PropTypes.object,
};

export default Tab;
