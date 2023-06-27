
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
            <>
              Combat potions used
            </>
          }
          thresholds={thresholds.potionsUsed}
        />
        <Requirement
          name={
            <>
              High quality combat potions used
            </>
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
          name={<>All items enchanted</>}
          thresholds={thresholds.itemsEnchanted}
        />
        <Requirement
          name={
            <>
              Using high quality enchants
            </>
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
            <>
              All weapons enhanced (oils/stones)
            </>
          }
          thresholds={thresholds.weaponsEnhanced}
        />
        <Requirement
          name={
            <>
              Using high quality weapon enhancements
            </>
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
            <>High quality flask used</>
          }
          thresholds={thresholds.higherFlaskPresent}
        />
        <Requirement
          name={<>Flask used</>}
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
            <>High quality food used</>
          }
          thresholds={thresholds.higherFoodPresent}
        />
        <Requirement
          name={<>Food used</>}
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
          name={<>Augment rune used</>}
          thresholds={thresholds.augmentRunePresent}
        />
      </>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <Rule
        name={<>Be well prepared</>}
        description={
          <>
            Being well prepared with food, flasks, potions and enchants is an easy way to improve
            your performance.
          </>
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
