import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import SPELLS from 'common/SPELLS/classic';
import { displayInstantCastSpells } from '../features/AlwaysBeCasting';

const CasterChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  return (
    <Checklist>
      {/* Downtime */}
      <Rule
        name="Always Be Casting"
        description={
          <>
            Try to avoid downtime during the fight. When moving, use your instant abilities, such as
            {displayInstantCastSpells()}
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      {/* Cooldowns */}
      <Rule
        name="Use Cooldowns Effectively"
        description="Use your cooldowns as often as possible to maximize your damage output."
      >
        {/* SPELLS listed here must be in ../features/Abilities */}
        <AbilityRequirement spell={SPELLS.STARFALL.id} />
        <AbilityRequirement spell={SPELLS.FORCE_OF_NATURE.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default CasterChecklist;
