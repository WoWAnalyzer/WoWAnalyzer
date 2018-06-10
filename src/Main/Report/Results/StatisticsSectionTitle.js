import React from 'react';
import PropTypes from 'prop-types';

class StatisticsSectionTitle extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children } = this.props;

    return (
      <div className="statistics-section-title">
        {children}
      </div>
    );
  }
}

export default StatisticsSectionTitle;
