import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { hasPremium } from 'Interface/selectors/user';
import Ad from 'Interface/common/Ad';

class StatisticsSectionTitle extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    rightAddon: PropTypes.node,
    premium: PropTypes.bool,
  };
  static defaultProps = {
    premium: false,
  };

  render() {
    const { children, rightAddon, premium } = this.props;

    return (
      <React.Fragment>
        {!premium && (
          <div className="text-center" style={{ marginTop: 40, marginBottom: rightAddon ? -20 : -65 }}>
            <Ad format="leaderboard" />
          </div>
        )}

        <div className="statistics-section-title">
          <h1>
            {children}
          </h1>
          {rightAddon && (
            <div className="pull-right">
              {rightAddon}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});
export default connect(
  mapStateToProps
)(StatisticsSectionTitle);
