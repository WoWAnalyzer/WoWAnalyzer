import React from 'react';
import PropTypes from 'prop-types';

import Checklist from './Checklist';
import Suggestions from './Suggestions';

const Overview = props => {
  const { checklist, issues } = props;
  return (
    <div className="container">
      <Checklist>
        {checklist}
      </Checklist>

      <Suggestions style={{ marginBottom: 0 }}>
        {issues}
      </Suggestions>
    </div>
  );
};

Overview.propTypes = {
  checklist: PropTypes.node,
  issues: PropTypes.array,
};

export default Overview;
