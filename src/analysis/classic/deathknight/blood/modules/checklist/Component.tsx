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
import SPELLS from 'common/SPELLS/classic';

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
            Avoid unnecessary downtime during the fight. If you have to be out of range, try casting
            instant spells such as <SpellLink spell={SPELLS.DEATH_COIL_DK} /> or refresh your
            diseases with <SpellLink spell={SPELLS.ICY_TOUCH} />.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns as often as possible to maximize your damage output.</>}
      >
        <AbilityRequirement spell={SPELLS.DANCING_RUNE_WEAPON.id} />
        <AbilityRequirement spell={SPELLS.EMPOWER_RUNE_WEAPON.id} />
        <AbilityRequirement spell={SPELLS.BONE_SHIELD.id} />
        <AbilityRequirement spell={SPELLS.BLOOD_TAP.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default MeleeChecklist;
