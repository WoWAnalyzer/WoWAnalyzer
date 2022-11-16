import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const PreservationEvokerChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  return (
    <Checklist>
      <Rule
        name="Don't overcap Essence"
        description={
          <>
            Abilities that cost essence like <SpellLink id={SPELLS.EMERALD_BLOSSOM.id} /> are very
            powerful and are a core part of your healing as a Preservation Evoker. Make sure you are
            not overcapping on Essence too often.
          </>
        }
      >
        <Requirement name="Essence Wasted" thresholds={thresholds.essenceDetails} />
      </Rule>
      <Rule
        name="Use your empowered spells wisely"
        description={
          <>
            Empowered spells like <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} /> make up a
            large portion of your healing. Be sure to use them often while keeping your overheal
            low.
          </>
        }
      >
        {combatant.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DREAM_BREATH_CAST.id} />
        )}
        {combatant.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} /> % Overheal
              </>
            }
            thresholds={thresholds.dreamBreath}
          />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default PreservationEvokerChecklist;
