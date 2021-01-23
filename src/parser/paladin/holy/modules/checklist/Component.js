import React from 'react';
import PropTypes from 'prop-types';
import { t, Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const HolyPaladinChecklist = ({ combatant, castEfficiency, thresholds, owner }) => {
  const AbilityRequirement = (props) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

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
            <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />
            {combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT) ? (
              <SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} />
            ) : (
              ''
            )}{' '}
            {combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT) ? (
              <SpellLink id={SPELLS.JUDGMENT_CAST.id} />
            ) : (
              ''
            )}{' '}
            {combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT) ? 'when using' : ''}{' '}
            {combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT) ? (
              <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_HEAL.id} />
            ) : (
              ''
            )}{' '}
            {combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT) ? (
              <SpellLink id={SPELLS.CRUSADER_STRIKE.id} />
            ) : (
              ''
            )}{' '}
            are your most efficient healing spells available. Try to cast them as much as possible
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
        <AbilityRequirement spell={SPELLS.HOLY_SHOCK_CAST.id} />
        <AbilityRequirement spell={SPELLS.HAMMER_OF_WRATH.id} />
        {combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.JUDGMENT_CAST.id} />
        )}
        {combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.BESTOW_FAITH_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.LIGHTS_HAMMER_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.CRUSADER_STRIKE.id} />
        )}
        {combatant.hasTalent(SPELLS.HOLY_PRISM_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.HOLY_PRISM_TALENT.id} />
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
        {!combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.AVENGING_WRATH.id} />
        )}
        {combatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.AVENGING_CRUSADER_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.HOLY_AVENGER_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.AURA_MASTERY.id} />
        {combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.RULE_OF_LAW_TALENT.id} />
        )}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (
        <AbilityRequirement spell={SPELLS.ASHEN_HALLOW.id} />
        )}
        {combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
        <AbilityRequirement spell={SPELLS.DIVINE_TOLL.id} />
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
            <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> and <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> are inefficient spells to cast
            compared to the alternatives. Try to only cast them when it will save someone's life or
            when you have to move and all other instant cast spells are on cooldown.
          </Trans>
        }
      >
        <Requirement
          name={
            <Trans id="paladin.holy.modules.checklist.totalFillerPerMinute">
              Total filler casts per minute
            </Trans>
          }
          thresholds={thresholds.fillerLightOfTheMartyrsCpm}
        />
        <Requirement
          name={
            <Trans id="paladin.holy.modules.checklist.totalFillerPerMinuteWhileHolyShock">
              Total filler casts while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was available
            </Trans>
          }
          thresholds={thresholds.fillerLightOfTheMartyrsInefficientCpm}
        />
        <Requirement
          name={
            <Trans id="paladin.holy.modules.checklist.totalFillerWhileHolyShock">
              Total filler <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />s cast while{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />
              </span>{' '}
              was available
            </Trans>
          }
          thresholds={thresholds.fillerFlashOfLight}
        />
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
          {!combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT.id) && (
            <Requirement
              name={
                <Trans id="paladin.holy.modules.checklist.beaconOfLightAppliedPrepull">
                  <SpellLink
                    id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id}
                    onClick={(e) => e.preventDefault()}
                  />{' '}
                  applied prepull
                </Trans>
              }
              thresholds={thresholds.beaconUptimeBoL}
            />
          )}
          {!combatant.hasTalent(SPELLS.BEACON_OF_VIRTUE_TALENT.id) && (
            <Requirement
              name={
                <Trans id="paladin.holy.modules.checklist.beaconOfVirtueTalentUptime">
                  <SpellLink
                    id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id}
                    onClick={(e) => e.preventDefault()}
                  />{' '}
                  Uptime
                </Trans>
              }
              thresholds={thresholds.beaconUptimeBoLUptime}
            />
          )}
          {combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT.id) && (
            <Requirement
              name={
                <Trans id="paladin.holy.modules.checklist.beaconOfFaithTalentAppliedPrepull">
                  <SpellLink
                    id={SPELLS.BEACON_OF_FAITH_TALENT.id}
                    onClick={(e) => e.preventDefault()}
                  />{' '}
                  applied prepull
                </Trans>
              }
              thresholds={thresholds.beaconUptimeBoF}
            />
          )}
          {combatant.hasTalent(SPELLS.BEACON_OF_FAITH_TALENT.id) && (
            <Requirement
              name={
                <Trans id="paladin.holy.modules.checklist.beaconOfFaithTalentUptime">
                  <SpellLink
                    id={SPELLS.BEACON_OF_FAITH_TALENT.id}
                    onClick={(e) => e.preventDefault()}
                  />{' '}
                  Uptime
                </Trans>
              }
              thresholds={thresholds.beaconUptimeBoFUptime}
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
            <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} onClick={(e) => e.preventDefault()} />
          </Trans>
        }
        description={
          <Trans id="paladin.holy.modules.checklist.positionWell.description">
            <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER.id} /> has a big impact on the strength of
            your heals. Try to stay close to the people you are healing to benefit the most from
            your Mastery. Use <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> when healing people
            further away.
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
        <AbilityRequirement spell={SPELLS.DIVINE_STEED.id} />
        <AbilityRequirement spell={SPELLS.DIVINE_PROTECTION.id} />
        <AbilityRequirement spell={SPELLS.BLESSING_OF_SACRIFICE.id} />
        <AbilityRequirement spell={SPELLS.LAY_ON_HANDS.id} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

HolyPaladinChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasCovenant: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  owner: PropTypes.object.isRequired,
};

export default HolyPaladinChecklist;
