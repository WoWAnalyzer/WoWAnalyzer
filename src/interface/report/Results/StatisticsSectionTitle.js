import React from 'react';
import PropTypes from 'prop-types';

const StatisticsSectionTitle = props => {
  const { children, rightAddon } = props;

  return (
    <div className="statistics-section-title">
      {rightAddon && (
        <div className="pull-right">
          {rightAddon}
        </div>
      )}
      <h1>
        {children}
      </h1>
    </div>
  );
};

StatisticsSectionTitle.propTypes = {
  children: PropTypes.node,
  rightAddon: PropTypes.node,
};

StatisticsSectionTitle.defaultProps = {
  premium: false,
};

export default StatisticsSectionTitle;
