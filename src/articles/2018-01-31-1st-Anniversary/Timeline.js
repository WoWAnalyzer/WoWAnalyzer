import React from 'react';
import PropTypes from 'prop-types';

import './Timeline.css';

const Timeline = ({ children }) => (
  <div className="timeline year-recap">
    {children}
  </div>
);
Timeline.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Timeline;
