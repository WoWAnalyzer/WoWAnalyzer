import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'interface/others/StatisticBox';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const TraitStatisticBox = ({trait, icon, label, ...others}) => {
  icon = icon || <SpellIcon id={trait} />;
  label = label || <SpellLink id={trait} icon={false} />;

  return (
    <StatisticBox icon={icon} label={label} {...others} />
  );
};

TraitStatisticBox.propTypes = {
  ...StatisticBox.propTypes,
  trait: PropTypes.number.isRequired,
  icon: PropTypes.node,
  label: PropTypes.node,
};

TraitStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.AZERITE_POWERS,
};

export default TraitStatisticBox;
