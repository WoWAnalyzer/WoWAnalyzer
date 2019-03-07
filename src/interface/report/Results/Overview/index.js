import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { hasPremium } from 'interface/selectors/user';
import Ad from 'interface/common/Ad';

import Checklist from './Checklist';
import Suggestions from './Suggestions';

class Overview extends React.PureComponent {
  static propTypes = {
    checklist: PropTypes.node,
    issues: PropTypes.array,
    premium: PropTypes.bool,
  };

  render() {
    const { checklist, issues, premium } = this.props;
    return (
      <div className="container">
        <Checklist>
          {checklist}
        </Checklist>

        {premium === false && (
          <div className="text-center" style={{ margin: '40px 0' }}>
            <Ad />
          </div>
        )}

        <Suggestions style={{ marginBottom: 0 }}>
          {issues}
        </Suggestions>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  premium: hasPremium(state),
});

export default connect(mapStateToProps)(Overview);
