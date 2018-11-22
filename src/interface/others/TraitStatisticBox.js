import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import './StatisticBox.css';
import STATISTIC_CATEGORY from './STATISTIC_CATEGORY';

export { default as STATISTIC_ORDER } from './STATISTIC_ORDER';

const TraitStatisticBox = ({ trait, icon, label, value, tooltip, containerProps, alignIcon, children, ...others }) => {
  delete others.category;
  delete others.position;

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12" {...containerProps}>
      <div className="panel statistic-box item" {...others}>
        <div className="panel-body flex">
          <div className="flex-sub statistic-icon" style={{ display: 'flex', alignItems: alignIcon }}>
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
        {children && (
          <>
            <div className="row">
              <div className="col-xs-12">
                {this.state.expanded && (
                  <div className="statistic-expansion">
                    {children}
                  </div>
                )}
              </div>
            </div>

            <div className="statistic-expansion-button-holster">
              <button onClick={this.toggleExpansion} className="btn btn-primary">
                {!this.state.expanded && <span className="glyphicon glyphicon-chevron-down" />}
                {this.state.expanded && <span className="glyphicon glyphicon-chevron-up" />}
              </button>
            </div>
          </>
        )}
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
  category: PropTypes.string,
  position: PropTypes.number,
  children: PropTypes.node,
};
TraitStatisticBox.defaultProps = {
  alignIcon: 'center',
  category: STATISTIC_CATEGORY.AZERITE_POWERS,
};

TraitStatisticBox.constructor() {
  super();
  this.state = {
    expanded: false,
  };
}

export default TraitStatisticBox;
