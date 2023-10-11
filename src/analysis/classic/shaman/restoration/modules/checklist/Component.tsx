import { Trans } from '@lingui/macro';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellIcon, SpellLink } from 'interface';
import { TooltipElement } from 'interface/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps as BaseChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import SPELLS from 'common/SPELLS/classic';
import { TotemElements } from 'analysis/classic/shaman/shared/totems/totemConstants';
import { TotemTracker } from 'analysis/classic/shaman/shared';

export interface ChecklistProps extends BaseChecklistProps {
  totemTracker: TotemTracker;
}

const HealerChecklist = ({
  thresholds,
  castEfficiency,
  combatant,
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
      <Rule
        name={
          <Trans id="classic.shaman.restoration.checklist.buffUptime">Keep your buffs up</Trans>
        }
        description={
          <Trans id="classic.shaman.restoration.checklist.buffUptime.description">
            Water Shield and Earth Shield should be applied prior to the fight starting and
            maintained. Your totems should be kept up as often as possible.
          </Trans>
        }
      >
        <>
          <Requirement
            name={
              <Trans id="classic.shaman.restoration.checklist.appliedPrepull">
                <SpellLink spell={SPELLS.EARTH_SHIELD} /> applied prepull
              </Trans>
            }
            thresholds={thresholds.earthShieldPrepull}
          />
          <Requirement
            name={
              <Trans id="classic.shaman.restoration.checklist.uptime">
                <SpellLink spell={SPELLS.EARTH_SHIELD} /> Uptime
              </Trans>
            }
            thresholds={thresholds.earthShieldUptime}
          />
        </>
        <Requirement
          name={
            <Trans id="classic.shaman.restoration.checklist.appliedPrepull">
              <SpellLink spell={SPELLS.WATER_SHIELD} /> applied prepull
            </Trans>
          }
          thresholds={thresholds.waterShieldPrepull}
        />
        <Requirement
          name={
            <Trans id="classic.shaman.restoration.checklist.uptime">
              <SpellLink spell={SPELLS.WATER_SHIELD} /> Uptime
            </Trans>
          }
          thresholds={thresholds.waterShieldUptime}
        />
        <Requirement
          name={
            <Trans id="classic.shaman.checklist.totemuptime.fire">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Fire)} /> Fire Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.fireTotemUptime}
        />
        <Requirement
          name={
            <Trans id="classic.shaman.checklist.totemuptime.water">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Water)} /> Water Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.waterTotemUptime}
        />
        <Requirement
          name={
            <Trans id="classic.shaman.checklist.totemuptime.earth">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Earth)} /> Earth Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.earthTotemUptime}
        />
        <Requirement
          name={
            <Trans id="classic.shaman.checklist.totemuptime.air">
              <SpellIcon spell={totemTracker.primaryTotemUsed(TotemElements.Air)} /> Air Totem
              Uptime
            </Trans>
          }
          thresholds={thresholds.airTotemUptime}
        />
      </Rule>
      <Rule
        name={
          <Trans id="classic.shaman.restoration.checklist.aoeSpell">
            Target AOE spells effectively
          </Trans>
        }
        description={
          <Trans id="classic.shaman.restoration.checklist.aoeSpell.description">
            Chain heal relies on who you target and where they are located to maximize healing
            potential. You should plan your chain heal ahead of time in preparation for where you
            expect raid members to be for the spells duration.
          </Trans>
        }
      >
        {thresholds.chainHealTargetThresholds.actual > 0 && (
          <Requirement
            name={
              <Trans id="classic.shaman.restoration.checklist.aoeSpell.targets">
                Average <SpellLink spell={SPELLS.CHAIN_HEAL} /> targets
              </Trans>
            }
            thresholds={thresholds.chainHealTargetThresholds}
          />
        )}
      </Rule>
      {/* Downtime */}
      <Rule
        name="Avoid Downtime"
        description={
          <>
            Try to avoid downtime during the fight. While it may be tempting to save mana, there is
            usually something you can do to contribute to the raid. You can reduce your downtime by
            reducing the delay between casting spells, anticipating movement, moving during the GCD,
            and{' '}
            <TooltipElement content="You can ignore this while learning to heal, but contributing DPS while healing is a major part of becoming a better than average player.">
              when you're not healing try to contribute some damage.*
            </TooltipElement>
            .
          </>
        }
      >
        <Requirement
          name="Non healing time"
          thresholds={thresholds.nonHealingTimeSuggestionThresholds}
        />
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      {/* Mana */}
      <Rule
        name={
          <>
            Use <ResourceLink id={RESOURCE_TYPES.MANA.id} /> Effectively
          </>
        }
        description="Try to use all your mana during a fight. As a guideline, try to match your mana level with the boss's health."
      >
        <Requirement name="Mana left" thresholds={thresholds.manaLeft} />
      </Rule>
      {/* Cooldowns */}
      <Rule
        name="Use Cooldowns Effectively"
        description={<>Use your cooldowns as often as possible to maximize your healing output.</>}
      >
        {/* SPELLS listed here must be in ../features/Abilities */}
        <AbilityRequirement spell={SPELLS.TIDAL_FORCE.id} />
        <AbilityRequirement spell={SPELLS.NATURES_SWIFTNESS.id} />
        <AbilityRequirement spell={SPELLS.MANA_TIDE_TOTEM.id} />
      </Rule>
      {/* Enchants and Consumes */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default HealerChecklist;
