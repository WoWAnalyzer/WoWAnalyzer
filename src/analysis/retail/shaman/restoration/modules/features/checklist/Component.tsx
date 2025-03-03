import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ResourceLink } from 'interface';
import { TooltipElement } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const RestoShamanChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
          <Trans id="shaman.restoration.checklist.efficientSpells">
            Use core efficient spells as often as possible
          </Trans>
        }
        description={
          <Trans id="shaman.restoration.checklist.efficientSpells.description">
            Spells such as <SpellLink spell={TALENTS.RIPTIDE_TALENT} />,{' '}
            <SpellLink spell={TALENTS.HEALING_RAIN_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT} /> are your most efficient
            spells available. Try to cast them as much as possible without overhealing.{' '}
            <TooltipElement
              content={t({
                id: 'shaman.restoration.checklist.efficientSpells.description.tooltip',
                message: `When you're not bringing too many healers.`,
              })}
            >
              On Mythic*
            </TooltipElement>{' '}
            you can often still cast these spells more even if you were overhealing by casting it
            quicker when it comes off cooldown and improving your target selection.
            <a
              href="https://www.wowhead.com/restoration-shaman-rotation-guide#raid-healing-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </Trans>
        }
      >
        {combatant.hasTalent(TALENTS.RIPTIDE_TALENT) && (
          <AbilityRequirement spell={TALENTS.RIPTIDE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.HEALING_RAIN_TALENT) && (
          <AbilityRequirement spell={TALENTS.HEALING_RAIN_TALENT.id} />
        )}
        {!combatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT) &&
          combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT) && (
            <AbilityRequirement spell={TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT.id} />
          )}
        {combatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT) && (
          <AbilityRequirement spell={TALENTS.CLOUDBURST_TOTEM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT) && (
          <AbilityRequirement spell={TALENTS.UNLEASH_LIFE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT) && (
          <AbilityRequirement spell={TALENTS.EARTHEN_WALL_TOTEM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.WELLSPRING_TALENT) && (
          <AbilityRequirement spell={TALENTS.WELLSPRING_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DOWNPOUR_TALENT) && (
          <AbilityRequirement spell={TALENTS.DOWNPOUR_TALENT.id} />
        )}
      </Rule>
      <Rule
        name={
          <Trans id="shaman.restoration.checklist.cooldownUsage">Use cooldowns effectively</Trans>
        }
        description={
          <Trans id="shaman.restoration.checklist.cooldownUsage.description">
            Your cooldowns are an important contributor to your healing throughput. Try to get in as
            many efficient casts as the fight allows.
            <a
              href="https://www.wowhead.com/restoration-shaman-rotation-guide#throughput-cooldowns"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </Trans>
        }
      >
        {combatant.hasTalent(TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT) &&
          !combatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT) && (
            <AbilityRequirement spell={TALENTS.HEALING_STREAM_TOTEM_SHARED_TALENT.id} />
          )}
        {combatant.hasTalent(TALENTS.SPIRIT_LINK_TOTEM_TALENT) && (
          <AbilityRequirement spell={TALENTS.SPIRIT_LINK_TOTEM_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT) && (
          <AbilityRequirement spell={TALENTS.ASCENDANCE_RESTORATION_TALENT.id} />
        )}
        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.BERSERKING.id) && (
          <AbilityRequirement spell={SPELLS.BERSERKING.id} />
        )}
      </Rule>
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
        {combatant.hasTalent(TALENTS.CHAIN_HEAL_TALENT) &&
          typeof thresholds.chainHealTargetThresholds.actual === 'number' &&
          thresholds.chainHealTargetThresholds.actual > 0 && (
            <Requirement
              name={
                <Trans id="shaman.restoration.checklist.aoeSpell.targets">
                  Average <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> targets
                </Trans>
              }
              thresholds={thresholds.chainHealTargetThresholds}
            />
          )}
        {combatant.hasTalent(TALENTS.HEALING_RAIN_TALENT) &&
          typeof thresholds.healingRainTargetThreshold.actual === 'number' &&
          thresholds.healingRainTargetThreshold.actual > 0 && (
            <Requirement
              name={
                <Trans id="shaman.restoration.checklist.aoeSpell.targets">
                  Average <SpellLink spell={SPELLS.HEALING_RAIN_HEAL} /> targets
                </Trans>
              }
              thresholds={thresholds.healingRainTargetThreshold}
            />
          )}
        {combatant.hasTalent(TALENTS.WELLSPRING_TALENT) && (
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.aoeSpell.efficiency">
                Average <SpellLink spell={TALENTS.WELLSPRING_TALENT} /> efficiency
              </Trans>
            }
            thresholds={thresholds.wellspringTargetThreshold}
          />
        )}
        {combatant.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT) && (
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.aoeSpell.efficiency">
                Average <SpellLink spell={TALENTS.EARTHEN_WALL_TOTEM_TALENT} /> efficiency
              </Trans>
            }
            thresholds={thresholds.ewtTargetThreshold}
          />
        )}
      </Rule>
      <Rule
        name={<Trans id="shaman.restoration.checklist.buffUptime">Keep your buffs up</Trans>}
        description={
          <Trans id="shaman.restoration.checklist.buffUptime.description">
            Water Shield and Earth Shield should be applied prior to the fight starting and
            maintained.
            <br />
            It is currently not possible to detect if you applied Water Shield before the pull or
            how good its uptime was, so just keep that in mind.
          </Trans>
        }
      >
        {combatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT) && (
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.appliedPrepull">
                <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> applied prepull
              </Trans>
            }
            thresholds={thresholds.earthShieldPrepull}
          />
        )}
        {combatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT) && (
          <Requirement
            name={
              <Trans id="shaman.restoration.checklist.uptime">
                <SpellLink spell={TALENTS.EARTH_SHIELD_TALENT} /> Uptime
              </Trans>
            }
            thresholds={thresholds.earthShieldUptime}
          />
        )}
      </Rule>
      <Rule
        name={
          <Trans id="shaman.restoration.checklist.inactivity">
            Try to avoid being inactive for a large portion of the fight
          </Trans>
        }
        description={
          <Trans id="shaman.restoration.checklist.inactivity.description">
            While it's suboptimal to always be casting as a healer you should still try to always be
            doing something during the entire fight and high downtime is inexcusable. You can reduce
            your downtime by reducing the delay between casting spells, anticipating movement,
            moving during the GCD, and{' '}
            <TooltipElement
              content={t({
                id: 'shaman.restoration.checklist.inactivity.description.tooltip',
                message: `While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.`,
              })}
            >
              when you're not healing try to contribute some damage*
            </TooltipElement>
            .
          </Trans>
        }
      >
        <Requirement
          name={
            <Trans id="shaman.restoration.checklist.inactivity.nonHealTime">Non healing time</Trans>
          }
          thresholds={thresholds.nonHealingTimeSuggestionThresholds}
        />
        <Requirement
          name={<Trans id="shaman.restoration.checklist.inactivity.downtime">Downtime</Trans>}
          thresholds={thresholds.downtimeSuggestionThresholds}
        />
      </Rule>
      <Rule
        name={
          <Trans id="shaman.restoration.checklist.manaUsage">
            Use all of your <ResourceLink id={RESOURCE_TYPES.MANA.id} /> effectively
          </Trans>
        }
        description={
          <Trans id="shaman.restoration.checklist.manaUsage.description">
            If you have a large amount of mana left at the end of the fight that's mana you could
            have turned into healing. Try to use all your mana during a fight. A good rule of thumb
            is to try to match your mana level with the boss's health.
          </Trans>
        }
      >
        <Requirement
          name={<Trans id="shaman.restoration.checklist.manaUsage.manaLeft">Mana left</Trans>}
          thresholds={thresholds.manaLeft}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default RestoShamanChecklist;
