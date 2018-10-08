import React from 'react';
import PropTypes from 'prop-types';

import Changelog from 'interface/home/Changelog';

const ChangelogTab = (_, { config }) => <Changelog changelog={config.changelog} />;
ChangelogTab.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default ChangelogTab;
