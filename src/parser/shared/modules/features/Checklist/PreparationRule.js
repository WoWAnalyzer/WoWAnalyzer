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
          name={<Trans>Used a pre-potion</Trans>}
          thresholds={thresholds.prePotion}
        />
        <Requirement
          name={<Trans>Used a second potion</Trans>}
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
  renderFlaskRequirements() {
    const { thresholds } = this.props;
    return (
      <>
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
        {this.renderPotionRequirements()}
        {this.renderFlaskRequirements()}
        {this.renderFoodRequirements()}
        {children}
      </Rule>
    );
  }
}

export default PreparationRule;
