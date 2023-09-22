import { Trans } from '@lingui/macro';
import { SpellLink, SpellIcon } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps as BaseChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import SPELLS from 'common/SPELLS/classic/shaman';
import { TotemElements } from 'analysis/classic/shaman/shared/totems/totemConstants';
import { TotemTracker } from 'analysis/classic/shaman/shared';

export interface ChecklistProps extends BaseChecklistProps {
  totemTracker: TotemTracker;
}

const MeleeChecklist = ({
  combatant,
  castEfficiency,
  thresholds,
  totemTracker,
}: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  return (
    <Checklist>
      {/* Totems */}
      <Rule name="Keep Buffs Up" description={<>Totem uptime:</>}>
        <Requirement
          name={
            <Trans id="shaman.checklist.totemuptime.fire">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Fire)} /> Fire Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.fireTotemUptime}
        />
        <Requirement
          name={
            <Trans id="shaman.checklist.totemuptime.water">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Water)} /> Water Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.waterTotemUptime}
        />
        <Requirement
          name={
            <Trans id="shaman.checklist.totemuptime.earth">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Earth)} /> Earth Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.earthTotemUptime}
        />
        <Requirement
          name={
            <Trans id="shaman.checklist.totemuptime.air">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Air)} /> Air Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.airTotemUptime}
        />
      </Rule>
      {/* Downtime */}
      <Rule
        name="Avoid Downtime"
        description={
          <>
            Avoid unnecessary downtime during the fight. If you have to move, try casting instant
            spells such as <SpellLink spell={SPELLS.FLAME_SHOCK} /> or{' '}
            <SpellLink spell={SPELLS.EARTH_SHOCK} />.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns as often as possible to maximize your damage output.</>}
      >
        {/* SPELLS listed here must be in ../features/Abilities */}
        <AbilityRequirement spell={SPELLS.FIRE_ELEMENTAL_TOTEM.id} />
        <AbilityRequirement spell={SPELLS.FERAL_SPIRIT.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default MeleeChecklist;
