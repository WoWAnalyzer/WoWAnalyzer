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
import SPELLS from 'common/SPELLS/classic/paladin';

const TankChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      {/* Downtime */}
      <Rule name="Mitigate Damage" description={<>Mitigate incoming damage</>}>
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.HOLY_SHIELD} /> applied Prepull
            </>
          }
          thresholds={thresholds.holyShieldPrepull}
        />
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.HOLY_SHIELD} /> Uptime
            </>
          }
          thresholds={thresholds.holyShieldUptime}
        />
      </Rule>
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns effectively to maximize damage output.</>}
      >
        <AbilityRequirement spell={SPELLS.AVENGING_WRATH.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default TankChecklist;
