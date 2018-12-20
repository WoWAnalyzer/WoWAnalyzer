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
  talent: PropTypes.number.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.node, // Override the icon requirement
  label: PropTypes.node, // Override the label requirement
  tooltip: PropTypes.string,
  footer: PropTypes.node,
  footerStyle: PropTypes.object,
  containerProps: PropTypes.object,
  item: PropTypes.bool,
  alignIcon: PropTypes.string,
  warcraftLogs: PropTypes.string,
  category: PropTypes.string,
  position: PropTypes.number,
  children: PropTypes.node,
};

TalentStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.TALENTS,
};

export default TalentStatisticBox;
