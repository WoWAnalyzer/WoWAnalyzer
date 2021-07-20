import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import React from 'react';

import * as SPELLS from '../../SPELLS';

const PriestChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use core abilities as often as possible"
        description={
          <>
            Using your core abilities as often as possible will typically result in better
            performance, remember to as often as you can!
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.PRAYER_OF_MENDING} />
      </Rule>
      <Rule
        name="Use cooldowns effectively"
        description={
          <>
            Cooldowns are an important part of healing, try to use them to counter fight mechanics.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.POWER_INFUSION} />
      </Rule>
      <Rule
        name={
          <>
            Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively
          </>
        }
        description="If you have a large amount of mana left at the end of the fight that's mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss's health."
      >
        <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default PriestChecklist;
