import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const TraitStatisticBox = ({ trait, icon, label, value, tooltip, containerProps, alignIcon, ilvl, ...others }) => {
  delete others.category;
  delete others.position;
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" {...containerProps}>
      <div className="panel statistic-box item" {...others}>
        <div className="panel-body flex">
          <div className="flex-sub" style={{ display: 'flex', alignItems: alignIcon }}>
            {icon || <SpellIcon id={trait} ilvl={ilvl} />}
          </div>
          <div className="flex-main">
            <div className="slabel">
              {label || <SpellLink id={trait} ilvl={ilvl} icon={false} />}
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
  value: PropTypes.node.isRequired,
  tooltip: PropTypes.string,
  containerProps: PropTypes.object,
  alignIcon: PropTypes.string,
  ilvl: PropTypes.number,
  category: PropTypes.string,
  position: PropTypes.number,
};
TraitStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.AZERITE_POWERS,
};

export default TraitStatisticBox;
