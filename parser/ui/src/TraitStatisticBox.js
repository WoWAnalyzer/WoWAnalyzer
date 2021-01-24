import React from 'react';
import PropTypes from 'prop-types';

import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';

import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';
import StatisticBox from './StatisticBox';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

/**
 * @deprecated Use `parser/ui/Statistic` instead.
 */
const TraitStatisticBox = ({ trait, icon, label, ...others }) => (
  <StatisticBox
    {...others}
    icon={icon || <SpellIcon id={trait} />}
    label={label || <SpellLink id={trait} icon={false} />}
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
};
TraitStatisticBox.defaultProps = {
  category: STATISTIC_CATEGORY.ITEMS, // combine with the items category since they're related and items never has more than 2 so keeping them separate is unnecessary
};

export default TraitStatisticBox;
