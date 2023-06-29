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
      <Requirement name={<>All items enchanted</>} thresholds={thresholds.itemsEnchanted} />
      <Requirement
        name={<>Using high quality enchants</>}
        thresholds={thresholds.itemsBestEnchanted}
      />
    </>
  );

  const RenderFlaskRequirements = () => (
    <>
      <Requirement name={<>Flask used</>} thresholds={thresholds.flaskPresent} />
    </>
  );

  const RenderFoodRequirements = () => (
    <>
      <Requirement name={<>High quality food used</>} thresholds={thresholds.higherFoodPresent} />
      <Requirement name={<>Food used</>} thresholds={thresholds.foodPresent} />
    </>
  );

  const RenderPotionRequirements = () => (
    <Requirement
      name={<>Combat Potion Efficiency</>}
      thresholds={thresholds.combatPotionThresholds}
    />
  );

  return (
    <Rule
      name={<>Be well prepared</>}
      description={
        <>
          Being well prepared with food, flasks, potions and enchants is an easy way to improve your
          performance.
        </>
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
