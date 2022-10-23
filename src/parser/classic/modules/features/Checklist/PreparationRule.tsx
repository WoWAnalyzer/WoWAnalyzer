import { Trans } from '@lingui/macro';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import * as React from 'react';

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

  const RenderPotionRequirements = () => (
    <Requirement
      name={
        <Trans id="shared.modules.features.checklist.combatPotionEfficiency">
          Combat Potion Efficiency
        </Trans>
      }
      thresholds={thresholds.combatPotionThresholds}
    />
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
      <RenderEnchantRequirements />
      <RenderFlaskRequirements />
      <RenderFoodRequirements />
      <RenderPotionRequirements />
      {children}
    </Rule>
  );
};

export default PreparationRule;
