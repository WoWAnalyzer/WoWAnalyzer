import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ResourceLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import { AbilityRequirementProps, ChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import React from 'react';

const GuardianDruidChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>      
      <Rule
        name="Rotational Spells"
        description={(
          <>
            Be sure to use <SpellLink id={SPELLS.MANGLE_BEAR.id} /> and <SpellLink id={SPELLS.THRASH_BEAR.id} /> on cooldown to maximise your <ResourceLink id={RESOURCE_TYPES.RAGE.id} /> generation and damage output.<br /> <SpellLink id={SPELLS.MAUL.id} /> can be used to avoid rage capping.
            Try to maximise the amount of <SpellLink id={SPELLS.IRONFUR.id} /> stacks you have while tanking. 
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.MANGLE_BEAR.id} />  
        <AbilityRequirement spell={SPELLS.THRASH_BEAR.id} />  
        <Requirement
          name={(<SpellLink id={SPELLS.IRONFUR.id} />)}
          thresholds={thresholds.ironFur}
        />         
      </Rule>      

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default GuardianDruidChecklist;
