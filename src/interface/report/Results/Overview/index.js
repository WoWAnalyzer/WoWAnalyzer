import React from 'react';
import PropTypes from 'prop-types';

import Checklist from './Checklist';
import Suggestions from './Suggestions';

class Overview extends React.PureComponent {
  static propTypes = {
    checklist: PropTypes.node,
    issues: PropTypes.array,
  };

  render() {
    const { checklist, issues } = this.props;
    return (
      <div className="container">
        <Checklist>
          {checklist}
        </Checklist>
        <Suggestions>
          {issues}
        </Suggestions>
      </div>
    );
  }
}

export default Overview;
