import React from 'react';
import PropTypes from 'prop-types';

import Rule from './Rule';
import Requirement from './Requirement';

class PreparationRule extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    thresholds: PropTypes.object.isRequired,
  };

  renderPotionRequirements() {
    const { thresholds } = this.props;

    return (
      <React.Fragment>
        <Requirement
          name="Used a pre-potion"
          thresholds={thresholds.prePotion}
        />
        <Requirement
          name="Used a second potion"
          thresholds={thresholds.secondPotion}
        />
      </React.Fragment>
    );
  }
  renderEnchantRequirements() {
    const { thresholds } = this.props;

    return (
      <React.Fragment>
        <Requirement
          name="All items enchanted"
          thresholds={thresholds.itemsEnchanted}
        />
        <Requirement
          name="Using high quality enchants"
          thresholds={thresholds.itemsBestEnchanted}
        />
      </React.Fragment>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Rule
        name="Be well prepared"
        description="Being well prepared with potions and enchants is an easy way to improve your performance."
      >
        {this.renderEnchantRequirements()}
        {this.renderPotionRequirements()}
        {children}
      </Rule>
    );
  }
}

export default PreparationRule;
