/* eslint-disable react/prop-types */
import React from 'react';

interface Props {
  rightAddon?: JSX.Element,
  premium: boolean
}

const StatisticsSectionTitle: React.FC<Props> = (props) => {
  const { rightAddon, children } = props;

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

StatisticsSectionTitle.defaultProps = {
  premium: false,
};

export default StatisticsSectionTitle;
