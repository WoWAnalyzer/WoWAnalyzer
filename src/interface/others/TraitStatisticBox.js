import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import StatisticBox from './StatisticBox';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const TraitStatisticBox = ({ trait, icon, label, className, ...others }) => (
  <StatisticBox
    {...others}
    icon={icon || <SpellIcon id={trait} />}
    label={label || <SpellLink id={trait} icon={false} />}
    className={`panel statistic-box item ${className || ''}`}
  />
);
TraitStatisticBox.propTypes = {
  trait: PropTypes.number,
  /**
   * Override the trait's icon.
   */
  icon: PropTypes.node,
  /**
   * Override the trait's label.
   */
  label: PropTypes.node,
  className: PropTypes.string,
};

TraitStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.AZERITE_POWERS,
};

export default TraitStatisticBox;
