import { getIcon } from 'parser/shared/modules/features/STAT';
import PropTypes from 'prop-types';
import React from 'react';

const PrimaryStat = ({ stat }) => {
  const Icon = getIcon(stat.toLowerCase());
  return <Icon />;
};
PrimaryStat.propTypes = {
  stat: PropTypes.string.isRequired,
};

export default PrimaryStat;
