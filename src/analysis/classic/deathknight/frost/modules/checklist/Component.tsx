import { SpellLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import SPELLS from 'common/SPELLS/classic/deathknight';

const MeleeChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
        name="Avoid Downtime"
        description={
          <>
            Avoid unnecessary downtime during the fight by staying within melee range of the boss.
            If you need to move out, used ranged abilities like{' '}
            <SpellLink spell={SPELLS.HOWLING_BLAST} />.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      {/* Cooldowns */}
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns as often as possible to maximize your damage output.</>}
      >
        {/* SPELLS listed here must be in ../features/Abilities */}
        <AbilityRequirement spell={SPELLS.PILLAR_OF_FROST.id} />
        <AbilityRequirement spell={SPELLS.EMPOWER_RUNE_WEAPON.id} />
        <AbilityRequirement spell={SPELLS.ARMY_OF_THE_DEAD.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default MeleeChecklist;
