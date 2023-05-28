import SPELLS from 'common/SPELLS/classic/deathknight';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const ClassicUnholyChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns as often as possible to maximize your damage output.</>}
      >
        <AbilityRequirement spell={SPELLS.SUMMON_GARGOYLE.id} />
        <AbilityRequirement spell={SPELLS.EMPOWER_RUNE_WEAPON.id} />
        <AbilityRequirement spell={SPELLS.ARMY_OF_THE_DEAD.id} />
      </Rule>
      <Rule
        name="Avoid Downtime"
        description={
          <>
            Avoid unnecessary downtime during the fight. If you have to move, try casting instant
            spells such as <SpellLink id={SPELLS.DEATH_COIL_DK} />.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ClassicUnholyChecklist;
