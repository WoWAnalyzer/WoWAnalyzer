import { Trans } from '@lingui/react/macro';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import * as React from 'react';
import { ReactNode } from 'react';

const RenderEnchantRequirements = ({
  itemsEnchanted,
  itemsBestEnchanted,
}: {
  itemsEnchanted: RequirementThresholds;
  itemsBestEnchanted: RequirementThresholds;
}) => (
  <>
    <Requirement
      name={<Trans id="shared.modules.features.checklist.enchanted">All items enchanted</Trans>}
      thresholds={itemsEnchanted}
    />
    <Requirement
      name={
        <Trans id="shared.modules.features.checklist.enchantedHigh">
          Using high quality enchants
        </Trans>
      }
      thresholds={itemsBestEnchanted}
    />
  </>
);

const RenderFlaskRequirements = ({ flaskPresent }: { flaskPresent: RequirementThresholds }) => (
  <>
    <Requirement
      name={<Trans id="shared.modules.features.checklist.flask">Flask used</Trans>}
      thresholds={flaskPresent}
    />
  </>
);

const RenderFoodRequirements = ({
  higherFoodPresent,
  foodPresent,
}: {
  higherFoodPresent: RequirementThresholds;
  foodPresent: RequirementThresholds;
}) => (
  <>
    <Requirement
      name={<Trans id="shared.modules.features.checklist.foodHigh">High quality food used</Trans>}
      thresholds={higherFoodPresent}
    />
    <Requirement
      name={<Trans id="shared.modules.features.checklist.food">Food used</Trans>}
      thresholds={foodPresent}
    />
  </>
);

const RenderPotionRequirements = ({
  combatPotionThresholds,
}: {
  combatPotionThresholds: RequirementThresholds;
}) => (
  <Requirement
    name={
      <Trans id="shared.modules.features.checklist.combatPotionEfficiency">
        Combat Potion Efficiency
      </Trans>
    }
    thresholds={combatPotionThresholds}
  />
);

const PreparationRule = ({
  thresholds,
  children,
}: {
  thresholds: Record<string, RequirementThresholds>;
  children?: ReactNode;
}) => {
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
      <RenderEnchantRequirements
        itemsEnchanted={thresholds.itemsEnchanted}
        itemsBestEnchanted={thresholds.itemsBestEnchanted}
      />
      <RenderFlaskRequirements flaskPresent={thresholds.flaskPresent} />
      <RenderFoodRequirements
        foodPresent={thresholds.foodPresent}
        higherFoodPresent={thresholds.higherFoodPresent}
      />
      <RenderPotionRequirements combatPotionThresholds={thresholds.combatPotionThresholds} />
      {children}
    </Rule>
  );
};

export default PreparationRule;
