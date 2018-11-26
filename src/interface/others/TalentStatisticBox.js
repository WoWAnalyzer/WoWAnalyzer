import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import StatisticBox from './StatisticBox';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const TalentStatisticBox = ({ talent, icon, label, ...others }) => {
  icon = icon || <SpellIcon id={talent} />;
  label = label || <SpellLink id={talent} icon={false} />;

  return (
    <StatisticBox icon={icon} label={label} item {...others} />
  );
};

TalentStatisticBox.propTypes = {
  ...StatisticBox.propTypes,
  talent: PropTypes.number.isRequired,
  icon: PropTypes.node, // Override the icon requirement
  label: PropTypes.node, // Override the label requirement
};

TalentStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.TALENTS,
};

export default TalentStatisticBox;
