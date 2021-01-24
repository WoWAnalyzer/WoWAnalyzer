import React from 'react';
import PropTypes from 'prop-types';

import { getIcon } from 'parser/shared/modules/features/STAT';

const PrimaryStat = ({ stat }) => {
  const Icon = getIcon(stat.toLowerCase());
  return <Icon />;
};
PrimaryStat.propTypes = {
  stat: PropTypes.string.isRequired,
};

export default PrimaryStat;
