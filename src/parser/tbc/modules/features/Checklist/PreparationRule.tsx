import { Trans } from '@lingui/macro';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import React from 'react';

const PreparationRule = ({
  thresholds,
  children,
}: {
  thresholds: any;
  children?: React.ReactNode;
}) => {
  const RenderEnchantRequirements = () => (
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

  const RenderWeaponEnhancementRequirements = () => (
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

  const RenderFlaskRequirements = () => (
    <>
      <Requirement
        name={<Trans id="shared.modules.features.checklist.flask">Flask used</Trans>}
        thresholds={thresholds.flaskPresent}
      />
    </>
  );

  const RenderFoodRequirements = () => (
    <>
      <Requirement
        name={<Trans id="shared.modules.features.checklist.foodHigh">High quality food used</Trans>}
        thresholds={thresholds.higherFoodPresent}
      />
      <Requirement
        name={<Trans id="shared.modules.features.checklist.food">Food used</Trans>}
        thresholds={thresholds.foodPresent}
      />
    </>
  );

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
      <RenderWeaponEnhancementRequirements />
      <RenderEnchantRequirements />
      <RenderFlaskRequirements />
      <RenderFoodRequirements />
      {children}
    </Rule>
  );
};

export default PreparationRule;
