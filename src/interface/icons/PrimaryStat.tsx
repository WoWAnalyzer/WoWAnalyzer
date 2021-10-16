import { default as STAT, getIcon } from 'parser/shared/modules/features/STAT';
import PropTypes from 'prop-types';
import React from 'react';

const PrimaryStat = (stat: STAT) => {
  const Icon = getIcon(stat);
  return <Icon />;
};
PrimaryStat.propTypes = {
  stat: PropTypes.string.isRequired,
};

export default PrimaryStat;
