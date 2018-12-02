import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'interface/others/StatisticBox';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import StatisticBox from './StatisticBox';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

<<<<<<< HEAD
const TraitStatisticBox = ({trait, icon, label, ...others}) => {
=======
const TraitStatisticBox = ({ trait, icon, label, ...others }) => {
>>>>>>> upstream/master
  icon = icon || <SpellIcon id={trait} />;
  label = label || <SpellLink id={trait} icon={false} />;

  return (
<<<<<<< HEAD
    <StatisticBox icon={icon} label={label} {...others} />
=======
    <StatisticBox icon={icon} label={label} item {...others} />
>>>>>>> upstream/master
  );
};

TraitStatisticBox.propTypes = {
  ...StatisticBox.propTypes,
  trait: PropTypes.number.isRequired,
  icon: PropTypes.node, // Override the icon requirement
  label: PropTypes.node, // Override the label requirement

};

TraitStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.AZERITE_POWERS,
};

export default TraitStatisticBox;
