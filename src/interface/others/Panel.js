import React from 'react';
import PropTypes from 'prop-types';

const Panel = ({ children, title, explanation, style, pad }) => (
  <div className="panel" style={style}>
    <div className="panel-heading">
      <h1>{title}</h1>
      {explanation && <small>{explanation}</small>}
    </div>
    <div className={`panel-body ${pad ? 'pad' : ''}`}>
      {children}
    </div>
  </div>
);
Panel.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  explanation: PropTypes.node,
  style: PropTypes.object,
  pad: PropTypes.bool,
};
Panel.defaultProps = {
  pad: true,
};

export default Panel;
