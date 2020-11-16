import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

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
          name={<Trans>Combat potions used</Trans>}
          thresholds={thresholds.potionsUsed}
        />
        <Requirement
          name={<Trans>High quality combat potions used</Trans>}
          thresholds={thresholds.bestPotionUsed}
        />
      </>
    );
  }
  renderEnchantRequirements() {
    const { thresholds } = this.props;

    return (
      <>
        <Requirement
          name={<Trans>All items enchanted</Trans>}
          thresholds={thresholds.itemsEnchanted}
        />
        <Requirement
          name={<Trans>Using high quality enchants</Trans>}
          thresholds={thresholds.itemsBestEnchanted}
        />
      </>
    );
  }
  renderWeaponEnhancementRequirements() {
    const { thresholds } = this.props;

    return (
      <>
        <Requirement
          name={<Trans>All weapons enhanced (oils/stones)</Trans>}
          thresholds={thresholds.weaponsEnhanced}
        />
        <Requirement
          name={<Trans>Using high quality weapon enhancements</Trans>}
          thresholds={thresholds.bestWeaponEnhancements}
        />
      </>
    );
  }
  renderFlaskRequirements() {
    const { thresholds } = this.props;
    return (
      <>
        <Requirement
          name={<Trans>High quality flask used</Trans>}
          thresholds={thresholds.higherFlaskPresent}
        />
        <Requirement
          name={<Trans>Flask used</Trans>}
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
          name={<Trans>High quality food used</Trans>}
          thresholds={thresholds.higherFoodPresent}
        />
        <Requirement
          name={<Trans>Food used</Trans>}
          thresholds={thresholds.foodPresent}
        />
      </>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Rule
        name={<Trans>Be well prepared</Trans>}
        description={<Trans>Being well prepared with food, flasks, potions and enchants is an easy way to improve your performance.</Trans>}
      >
        {this.renderEnchantRequirements()}
        {this.renderWeaponEnhancementRequirements()}
        {this.renderPotionRequirements()}
        {this.renderFlaskRequirements()}
        {this.renderFoodRequirements()}
        {children}
      </Rule>
    );
  }
}

export default PreparationRule;
