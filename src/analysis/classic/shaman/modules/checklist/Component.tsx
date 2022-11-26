import { Trans } from '@lingui/macro';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellIcon, SpellLink } from 'interface';
import { ResourceLink } from 'interface';
import { TooltipElement } from 'interface/Tooltip';
import Checklist from 'parser/shared/modules/features/Checklist';
import { ChecklistProps as BackChecklistProps } from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';

import { Build } from '../../CONFIG';
import SPELLS from 'common/SPELLS/classic/shaman';
import { TotemElements } from '../../totemConstants';
import TotemTracker from '../features/TotemTracker';

export interface ChecklistProps extends BackChecklistProps {
  build?: string;
  totemTracker: TotemTracker;
}

const ShamanChecklist = ({ thresholds, totemTracker, build }: ChecklistProps) => (
  <Checklist>
    <Rule
      name={<Trans id="shaman.restoration.checklist.buffUptime">Keep your buffs up</Trans>}
      description={
        <Trans id="shaman.restoration.checklist.buffUptime.description">
          Water Shield and Earth Shield should be applied prior to the fight starting and
          maintained. Your totems should be kept up as often as possible.
        </Trans>
      }
    >
      {build === Build.DEFAULT && (
        <>
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.appliedPrepull">
                <SpellLink id={SPELLS.EARTH_SHIELD.id} /> applied prepull
              </Trans>
            }
            thresholds={thresholds.earthShieldPrepull}
          />
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.uptime">
                <SpellLink id={SPELLS.EARTH_SHIELD.id} /> Uptime
              </Trans>
            }
            thresholds={thresholds.earthShieldUptime}
          />
        </>
      )}
      <Requirement
        name={
          <Trans id="shaman.restoration.checklist.appliedPrepull">
            <SpellLink id={SPELLS.WATER_SHIELD.id} /> applied prepull
          </Trans>
        }
        thresholds={thresholds.waterShieldPrepull}
      />
      <Requirement
        name={
          <Trans id="shaman.restoration.checklist.uptime">
            <SpellLink id={SPELLS.WATER_SHIELD.id} /> Uptime
          </Trans>
        }
        thresholds={thresholds.waterShieldUptime}
      />
      <Requirement
        name={
          <Trans id="shaman.checklist.totemuptime.fire">
            <SpellIcon id={totemTracker.primaryTotemUsed(TotemElements.Fire)} /> Fire Totem Uptime
          </Trans>
        }
        thresholds={thresholds.fireTotemUptime}
      />
      <Requirement
        name={
          <Trans id="shaman.checklist.totemuptime.water">
            <SpellIcon id={totemTracker.primaryTotemUsed(TotemElements.Water)} /> Water Totem Uptime
          </Trans>
        }
        thresholds={thresholds.waterTotemUptime}
      />
      <Requirement
        name={
          <Trans id="shaman.checklist.totemuptime.earth">
            <SpellIcon id={totemTracker.primaryTotemUsed(TotemElements.Earth)} /> Earth Totem Uptime
          </Trans>
        }
        thresholds={thresholds.earthTotemUptime}
      />
      <Requirement
        name={
          <Trans id="shaman.checklist.totemuptime.air">
            <SpellIcon id={totemTracker.primaryTotemUsed(TotemElements.Air)} /> Air Totem Uptime
          </Trans>
        }
        thresholds={thresholds.airTotemUptime}
      />
    </Rule>
    {build === Build.DEFAULT && (
      <Rule
        name={
          <Trans id="shaman.restoration.checklist.aoeSpell">Target AOE spells effectively</Trans>
        }
        description={
          <Trans id="shaman.restoration.checklist.aoeSpell.description">
            As a resto shaman our core AOE spells rely on not just who we target but where they are
            on the ground to maximize healing potential. You should plan you AOE spells ahead of
            time in preparation for where you expect raid members to be for the spells duration.
          </Trans>
        }
      >
        {thresholds.chainHealTargetThresholds.actual > 0 && (
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.aoeSpell.targets">
                Average <SpellLink id={SPELLS.CHAIN_HEAL.id} /> targets
              </Trans>
            }
            thresholds={thresholds.chainHealTargetThresholds}
          />
        )}
      </Rule>
    )}
    {build === Build.DEFAULT && (
      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            High downtime is something to avoid. While it may be tempting to not cast and save mana,
            there is usually something you can do to contribute to the raid. You can reduce your
            downtime by reducing the delay between casting spells, anticipating movement, moving
            during the GCD, and{' '}
            <TooltipElement content="You can ignore this while learning Resto, but contributing DPS whilst healing is a major part of becoming a better than average player.">
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
    )}
    {build !== Build.DEFAULT && (
      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            High downtime is something to avoid. While it may be tempting to not cast and save mana,
            there is usually something you can do to contribute to the raid. You can reduce your
            downtime by reducing the delay between casting spells, anticipating movement, moving
            during the GCD.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
    )}

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

export default ShamanChecklist;
