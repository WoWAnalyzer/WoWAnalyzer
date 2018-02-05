import React from 'react';
import PropTypes from 'prop-types';

const TimelineItem = ({ title, date, children }) => (
  <div className="panel">
    <div className="date">
      {date}
    </div>
    <div className="panel-heading">
      <h2>{title}</h2>
    </div>
    <div className="panel-body">
      {children}
    </div>
  </div>
);
TimelineItem.propTypes = {
  title: PropTypes.node.isRequired,
  date: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default TimelineItem;
