import React from 'react';
import PropTypes from 'prop-types';

const ChangelogTab = (_, { config }) => (
  <div style={{ padding: 0 }}>
    <ul className="list text">
      {config.changelog
        .trim()
        .split('\n')
        .map((change, i) => (
          <li key={`${i}`} dangerouslySetInnerHTML={{ __html: change }} />
        ))}
    </ul>
  </div>
);
ChangelogTab.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default ChangelogTab;
