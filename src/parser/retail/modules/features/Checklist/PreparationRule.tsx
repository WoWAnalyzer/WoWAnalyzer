import { Trans } from '@lingui/macro';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import { PureComponent, ReactNode } from 'react';

interface PreparationRuleProps {
  children?: ReactNode;
  thresholds: Record<string, RequirementThresholds>;
}
class PreparationRule extends PureComponent<PreparationRuleProps> {
  renderPotionRequirements() {
    const { thresholds } = this.props;

    return (
      <>
        <Requirement
          name={
            <Trans id="shared.modules.features.checklist.combatPotionsUsed">
              Combat potions used
            </Trans>
          }
          thresholds={thresholds.potionsUsed}
        />
        <Requirement
          name={
            <Trans id="shared.modules.features.checklist.highQualityCombatPotionsUsed">
              High quality combat potions used
            </Trans>
          }
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
          name={<Trans id="shared.modules.features.checklist.enchanted">All items enchanted</Trans>}
          thresholds={thresholds.itemsEnchanted}
        />
        <Requirement
          name={
            <Trans id="shared.modules.features.checklist.enchantedHigh">
              Using high quality enchants
            </Trans>
          }
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
          name={
            <Trans id="shared.modules.features.checklist.allWeaponsEnhanced">
              All weapons enhanced (oils/stones)
            </Trans>
          }
          thresholds={thresholds.weaponsEnhanced}
        />
        <Requirement
          name={
            <Trans id="shared.modules.features.checklist.highQualityWeaponEnhancements">
              Using high quality weapon enhancements
            </Trans>
          }
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
          name={
            <Trans id="shared.modules.features.checklist.flaskHigh">High quality flask used</Trans>
          }
          thresholds={thresholds.higherFlaskPresent}
        />
        <Requirement
          name={<Trans id="shared.modules.features.checklist.flask">Flask used</Trans>}
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
          name={
            <Trans id="shared.modules.features.checklist.foodHigh">High quality food used</Trans>
          }
          thresholds={thresholds.higherFoodPresent}
        />
        <Requirement
          name={<Trans id="shared.modules.features.checklist.food">Food used</Trans>}
          thresholds={thresholds.foodPresent}
        />
      </>
    );
  }
  renderAugmentRuneRequirements() {
    const { thresholds } = this.props;
    return (
      <>
        <Requirement
          name={<Trans id="shared.modules.features.checklist.augmentRune">Augment rune used</Trans>}
          thresholds={thresholds.augmentRunePresent}
        />
      </>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Rule
        name={<Trans id="shared.modules.features.checklist.wellPrepared">Be well prepared</Trans>}
        description={
          <Trans id="shared.modules.features.checklist.wellPreparedDetails">
            Being well prepared with food, flasks, potions and enchants is an easy way to improve
            your performance.
          </Trans>
        }
      >
        {this.renderEnchantRequirements()}
        {this.renderWeaponEnhancementRequirements()}
        {this.renderPotionRequirements()}
        {this.renderFlaskRequirements()}
        {this.renderFoodRequirements()}
        {this.renderAugmentRuneRequirements()}
        {children}
      </Rule>
    );
  }
}

export default PreparationRule;
