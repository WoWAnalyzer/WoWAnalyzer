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
      <>
        <Requirement
          name="Used a pre-potion"
          thresholds={thresholds.prePotion}
        />
        <Requirement
          name="Used a second potion"
          thresholds={thresholds.secondPotion}
        />
      </>
    );
  }
  renderEnchantRequirements() {
    const { thresholds } = this.props;

    return (
      <>
        <Requirement
          name="All items enchanted"
          thresholds={thresholds.itemsEnchanted}
        />
        <Requirement
          name="Using high quality enchants"
          thresholds={thresholds.itemsBestEnchanted}
        />
      </>
    );
  }
  renderFlaskRequirements() {
    const { thresholds } = this.props;
    return (
      <>
        <Requirement
          name="Flask used"
          thresholds={thresholds.flaskPresent}
        />
      </>
    );
  }
  renderFoodRequirements() {
    const { thresholds } = this.props;
    return (
      <>
        <Requirement
          name="High Quality Food used"
          thresholds={thresholds.higherfoodPresent}
        />
      <Requirement
        name="Food used"
        thresholds={thresholds.foodPresent}
      />
      </>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Rule
        name="Be well prepared"
        description="Being well prepared with food, flasks, potions and enchants is an easy way to improve your performance."
      >
        {this.renderEnchantRequirements()}
        {this.renderPotionRequirements()}
        {this.renderFlaskRequirements()}
        {this.renderFoodRequirements()}
        {children}
      </Rule>
    );
  }
}

export default PreparationRule;
