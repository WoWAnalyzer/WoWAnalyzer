import React from 'react';
import PropTypes from 'prop-types';

class StatisticsSectionTitle extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    rightAddon: PropTypes.node,
  };
  static defaultProps = {
    premium: false,
  };

  render() {
    const { children, rightAddon } = this.props;

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
  }
}

export default StatisticsSectionTitle;
