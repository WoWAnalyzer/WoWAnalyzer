import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const TalentStatisticBox = ({ trait, icon, label, value, tooltip, containerProps, alignIcon, ...others }) => {
  delete others.category;
  delete others.position;
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" {...containerProps}>
      <div className="panel statistic-box item" {...others}>
        <div className="panel-body flex">
          <div className="flex-sub" style={{ display: 'flex', alignItems: alignIcon }}>
            {icon || <SpellIcon id={trait} />}
          </div>
          <div className="flex-main">
            <div className="slabel">
              {label || <SpellLink id={trait} icon={false} />}
            </div>
            <dfn data-tip={tooltip} className="value">
              {value}
            </dfn>
          </div>
        </div>
      </div>
    </div>
  );
};
TalentStatisticBox.propTypes = {
  trait: PropTypes.number,
  icon: PropTypes.node, // Override the trait's icon.
  label: PropTypes.node, // Override the trait's label.
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  containerProps: PropTypes.object,
  alignIcon: PropTypes.string,
  category: PropTypes.string,
  position: PropTypes.number,
};
TalentStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.AZERITE_POWERS,
};

export default TalentStatisticBox;
