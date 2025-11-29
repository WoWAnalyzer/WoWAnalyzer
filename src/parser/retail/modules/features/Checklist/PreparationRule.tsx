import { Trans } from '@lingui/react/macro';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  thresholds: Record<string, RequirementThresholds>;
}

const PreparationRule = ({ children, thresholds }: Props) => {
  const renderPotionRequirements = () => {
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
  };

  const renderEnchantRequirements = () => {
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
  };

  const renderWeaponEnhancementRequirements = () => {
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
  };

  const renderFlaskRequirements = () => {
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
  };

  const renderFoodRequirements = () => {
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
  };

  const renderAugmentRuneRequirements = () => {
    return (
      <>
        <Requirement
          name={<Trans id="shared.modules.features.checklist.augmentRune">Augment rune used</Trans>}
          thresholds={thresholds.augmentRunePresent}
        />
      </>
    );
  };

  return (
    <Rule
      name={<Trans id="shared.modules.features.checklist.wellPrepared">Be well prepared</Trans>}
      description={
        <Trans id="shared.modules.features.checklist.wellPreparedDetails">
          Being well prepared with food, flasks, potions and enchants is an easy way to improve your
          performance.
        </Trans>
      }
    >
      {renderEnchantRequirements()}
      {renderWeaponEnhancementRequirements()}
      {renderPotionRequirements()}
      {renderFlaskRequirements()}
      {renderFoodRequirements()}
      {renderAugmentRuneRequirements()}
      {children}
    </Rule>
  );
};

export default PreparationRule;
