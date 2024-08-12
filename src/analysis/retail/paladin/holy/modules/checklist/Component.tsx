import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
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

const HolyPaladinChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  // TODO: confirm all requirements are correct since 10.X update

  return (
    <Checklist>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.usePrimarySpells">
            Use your primary healing spells as often as possible
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.usePrimarySpells.description">
            <SpellLink spell={SPELLS.HOLY_SHOCK_HEAL} />
            is your most efficient healing spell available. Try to cast them as much as possible
            without overhealing.
            <TooltipElement
              content={t({
                id: 'paladin.holy.modules.checklist.usePrimarySpells.descriptionTooltipElement',
                message: `When you're not bringing too many healers.`,
              })}
            >
              On Mythic
            </TooltipElement>{' '}
            you can often still cast these spells more even if you were overhealing by casting it
            quicker when it comes off cooldown and improving your target selection.{' '}
            <a
              href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </Trans>
        }
      >
        {combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT) && (
          <AbilityRequirement spell={TALENTS.HOLY_SHOCK_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.HOLY_PRISM_TALENT) && (
          <AbilityRequirement spell={TALENTS.HOLY_PRISM_TALENT.id} />
        )}
        {/* Add IoL Consumption */}
        {combatant.hasTalent(TALENTS.BARRIER_OF_FAITH_TALENT) && (
          <AbilityRequirement spell={TALENTS.BARRIER_OF_FAITH_TALENT.id} />
        )}
      </Rule>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.useCooldownsEffectively">
            Use your cooldowns effectively
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.useCooldownsEffectively.description">
            Your cooldowns are an important contributor to your healing throughput. Try to get in as
            many efficient casts as the fight allows.{' '}
            <a
              href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </Trans>
        }
      >
        {/* Avenging Crusader replaces Avenging Wrath */}
        {!combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT) && (
          <AbilityRequirement spell={SPELLS.AVENGING_WRATH.id} />
        )}
        {combatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT) && (
          <AbilityRequirement spell={TALENTS.AVENGING_CRUSADER_TALENT.id} />
        )}

        <AbilityRequirement spell={SPELLS.AURA_MASTERY.id} />
        {combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_TOLL_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.HAND_OF_DIVINITY_TALENT) && (
          <AbilityRequirement spell={TALENTS.HAND_OF_DIVINITY_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DIVINE_FAVOR_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_FAVOR_TALENT.id} />
        )}

        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
      </Rule>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.avoidFillerSpells">
            Avoiding Filler Spells
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.avoidFillerSpells.description">
            <SpellLink spell={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} /> and{' '}
            <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> are inefficient spells to cast compared to
            the alternatives. Try to only cast them when it will save someone's life or when you
            have to move and all other instant cast spells are on cooldown.
          </Trans>
        }
      >
        <Requirement
          name={
            <Trans id="paladin.holy.modules.checklist.totalFillerWhileHolyShock">
              Total filler <SpellLink spell={SPELLS.FLASH_OF_LIGHT} />s cast while{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} />
              </span>{' '}
              was available
            </Trans>
          }
          thresholds={thresholds.fillerFlashOfLight}
        />
        {combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT) && (
          <AbilityRequirement spell={TALENTS.HOLY_SHOCK_TALENT.id} />
        )}
      </Rule>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.dontTunnelTanks">Effective Beacon Usage</Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.dontTunnelTanks.description">
            A common misconception about Holy Paladins is that we should focus tanks when healing.
            This is actually inefficient. Let your beacons do most of the work, ask your co-healers
            to keep efficient HoTs on the tanks and only directly heal the tanks when they would
            otherwise die.
          </Trans>
        }
      >
        {!combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT) && (
          <Requirement
            name={
              <Trans id="paladin.holy.modules.checklist.beaconOfLightAppliedPrepull">
                <SpellLink
                  spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                applied prepull
              </Trans>
            }
            thresholds={thresholds.beaconUptimeBoL}
          />
        )}
        {!combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT) && (
          <Requirement
            name={
              <Trans id="paladin.holy.modules.checklist.beaconOfVirtueTalentUptime">
                <SpellLink
                  spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                Uptime
              </Trans>
            }
            thresholds={thresholds.beaconUptimeBoLUptime}
          />
        )}
        {combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT) && (
          <Requirement
            name={
              <Trans id="paladin.holy.modules.checklist.beaconOfFaithTalentAppliedPrepull">
                <SpellLink
                  spell={TALENTS.BEACON_OF_FAITH_TALENT}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                applied prepull
              </Trans>
            }
            thresholds={thresholds.beaconUptimeBoF}
          />
        )}
        {combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT) && (
          <Requirement
            name={
              <Trans id="paladin.holy.modules.checklist.beaconOfFaithTalentUptime">
                <SpellLink
                  spell={TALENTS.BEACON_OF_FAITH_TALENT}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                Uptime
              </Trans>
            }
            thresholds={thresholds.beaconUptimeBoFUptime}
          />
        )}
        {combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT) && (
          <Requirement
            name={
              <Trans id="paladin.holy.modules.checklist.beaconOfVirtueTalentUptime">
                <SpellLink
                  spell={TALENTS.BEACON_OF_VIRTUE_TALENT}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                Uptime
              </Trans>
            }
            thresholds={thresholds.beaconUptimeBoVUptime}
          />
        )}
        <Requirement
          name={
            <Trans id="paladin.holy.modules.checklist.directBeaconHealing">
              Direct beacon healing
            </Trans>
          }
          thresholds={thresholds.directBeaconHealing}
        />
      </Rule>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.positionWell">
            Position yourself well to maximize{' '}
            <SpellLink spell={SPELLS.MASTERY_LIGHTBRINGER} onClick={(e) => e.preventDefault()} />
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.positionWell.description">
            <SpellLink spell={SPELLS.MASTERY_LIGHTBRINGER} /> has a big impact on the strength of
            your heals. Try to stay close to the people you are healing to benefit the most from
            your Mastery.
          </Trans>
        }
      >
        <Requirement
          name={
            <Trans id="paladin.holy.modules.checklist.masteryEffectiveness">
              Mastery effectiveness
            </Trans>
          }
          thresholds={thresholds.masteryEffectiveness}
        />
      </Rule>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.avoidBeingInactive">
            Try to avoid being inactive for a large portion of the fight
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.avoidBeingInactive.description">
            While it's suboptimal to always be casting as a healer you should still try to always be
            doing something during the entire fight and high downtime is inexcusable. You can reduce
            your downtime by reducing the delay between casting spells, anticipating movement,
            moving during the GCD, and{' '}
            <TooltipElement
              content={t({
                id: 'paladin.holy.modules.checklist.avoidBeingInactive.description.ignoreDamage',
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
          name={<Trans id="paladin.holy.modules.checklist.nonHealingTime">Non healing time</Trans>}
          thresholds={thresholds.nonHealingTimeSuggestionThresholds}
        />
        <Requirement
          name={<Trans id="paladin.holy.modules.checklist.downtime">Downtime</Trans>}
          thresholds={thresholds.downtimeSuggestionThresholds}
        />
      </Rule>
      <Rule
        name={
          <Trans id="paladin.holy.modules.checklist.useSupportiveAbilities">
            Use your supportive abilities
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.useSupportiveAbilities.description">
            While you shouldn't aim to cast defensives and externals on cooldown, be aware of them
            and try to use them whenever effective. Not using them at all indicates you might not be
            aware of them enough or not utilizing them optimally.
          </Trans>
        }
      >
        {combatant.hasTalent(TALENTS.DIVINE_STEED_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_STEED_TALENT.id} />
        )}

        <AbilityRequirement spell={SPELLS.DIVINE_PROTECTION.id} />

        {combatant.hasTalent(TALENTS.BLESSING_OF_SACRIFICE_TALENT) && (
          <AbilityRequirement spell={TALENTS.BLESSING_OF_SACRIFICE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.LAY_ON_HANDS_TALENT) && (
          <AbilityRequirement spell={TALENTS.LAY_ON_HANDS_TALENT.id} />
        )}
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default HolyPaladinChecklist;
