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
        name={<>Use your primary healing spells as often as possible</>}
        description={
          <>
            <SpellLink id={SPELLS.HOLY_SHOCK_HEAL} />
            is your most efficient healing spell available. Try to cast them as much as possible
            without overhealing.
            <TooltipElement content={`When you're not bringing too many healers.`}>
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
          </>
        }
      >
        {combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT) && (
          <AbilityRequirement spell={TALENTS.HOLY_SHOCK_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.HAMMER_OF_WRATH_TALENT) && (
          <AbilityRequirement spell={TALENTS.HAMMER_OF_WRATH_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.BESTOW_FAITH_TALENT) && (
          <AbilityRequirement spell={TALENTS.BESTOW_FAITH_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.LIGHTS_HAMMER_TALENT) && (
          <AbilityRequirement spell={TALENTS.LIGHTS_HAMMER_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.CRUSADERS_MIGHT_TALENT) && (
          <AbilityRequirement spell={SPELLS.CRUSADER_STRIKE.id} />
        )}
        {combatant.hasTalent(TALENTS.HOLY_PRISM_TALENT) && (
          <AbilityRequirement spell={TALENTS.HOLY_PRISM_TALENT.id} />
        )}
      </Rule>
      <Rule
        name={<>Use your cooldowns effectively</>}
        description={
          <>
            Your cooldowns are an important contributor to your healing throughput. Try to get in as
            many efficient casts as the fight allows.{' '}
            <a
              href="https://www.wowhead.com/holy-paladin-rotation-guide#gameplay-and-priority-list"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
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
        {combatant.hasTalent(TALENTS.RULE_OF_LAW_TALENT) && (
          <AbilityRequirement spell={TALENTS.RULE_OF_LAW_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_TOLL_TALENT.id} />
        )}

        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
      </Rule>
      <Rule
        name={<>Avoiding Filler Spells</>}
        description={
          <>
            <SpellLink id={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} /> and{' '}
            <SpellLink id={SPELLS.FLASH_OF_LIGHT} /> are inefficient spells to cast compared to the
            alternatives. Try to only cast them when it will save someone's life or when you have to
            move and all other instant cast spells are on cooldown.
          </>
        }
      >
        <Requirement
          name={<>Total filler casts per minute</>}
          thresholds={thresholds.fillerLightOfTheMartyrsCpm}
        />
        <Requirement
          name={
            <>
              Total filler casts while <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} /> was available
            </>
          }
          thresholds={thresholds.fillerLightOfTheMartyrsInefficientCpm}
        />
        <Requirement
          name={
            <>
              Total filler <SpellLink id={SPELLS.FLASH_OF_LIGHT} />s cast while{' '}
              <span style={{ whiteSpace: 'nowrap' }}>
                <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} />
              </span>{' '}
              was available
            </>
          }
          thresholds={thresholds.fillerFlashOfLight}
        />
        {combatant.hasTalent(TALENTS.HOLY_SHOCK_TALENT) && (
          <AbilityRequirement spell={TALENTS.HOLY_SHOCK_TALENT.id} />
        )}
      </Rule>
      <Rule
        name={<>Effective Beacon Usage</>}
        description={
          <>
            A common misconception about Holy Paladins is that we should focus tanks when healing.
            This is actually inefficient. Let your beacons do most of the work, ask your co-healers
            to keep efficient HoTs on the tanks and only directly heal the tanks when they would
            otherwise die.
          </>
        }
      >
        {!combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink
                  id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                applied prepull
              </>
            }
            thresholds={thresholds.beaconUptimeBoL}
          />
        )}
        {!combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink
                  id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                Uptime
              </>
            }
            thresholds={thresholds.beaconUptimeBoLUptime}
          />
        )}
        {combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink
                  id={TALENTS.BEACON_OF_FAITH_TALENT}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                applied prepull
              </>
            }
            thresholds={thresholds.beaconUptimeBoF}
          />
        )}
        {combatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink
                  id={TALENTS.BEACON_OF_FAITH_TALENT}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                Uptime
              </>
            }
            thresholds={thresholds.beaconUptimeBoFUptime}
          />
        )}
        {combatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink
                  id={TALENTS.BEACON_OF_VIRTUE_TALENT}
                  onClick={(e) => e.preventDefault()}
                />{' '}
                Uptime
              </>
            }
            thresholds={thresholds.beaconUptimeBoVUptime}
          />
        )}
        <Requirement
          name={<>Direct beacon healing</>}
          thresholds={thresholds.directBeaconHealing}
        />
      </Rule>
      <Rule
        name={
          <>
            Position yourself well to maximize{' '}
            <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER} onClick={(e) => e.preventDefault()} />
          </>
        }
        description={
          <>
            <SpellLink id={SPELLS.MASTERY_LIGHTBRINGER} /> has a big impact on the strength of your
            heals. Try to stay close to the people you are healing to benefit the most from your
            Mastery. Use <SpellLink id={TALENTS.RULE_OF_LAW_TALENT} /> when healing people further
            away.
          </>
        }
      >
        <Requirement
          name={<>Mastery effectiveness</>}
          thresholds={thresholds.masteryEffectiveness}
        />
      </Rule>
      <Rule
        name={<>Try to avoid being inactive for a large portion of the fight</>}
        description={
          <>
            While it's suboptimal to always be casting as a healer you should still try to always be
            doing something during the entire fight and high downtime is inexcusable. You can reduce
            your downtime by reducing the delay between casting spells, anticipating movement,
            moving during the GCD, and{' '}
            <TooltipElement
              content={`While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.`}
            >
              when you're not healing try to contribute some damage*
            </TooltipElement>
            .
          </>
        }
      >
        <Requirement
          name={<>Non healing time</>}
          thresholds={thresholds.nonHealingTimeSuggestionThresholds}
        />
        <Requirement name={<>Downtime</>} thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <Rule
        name={<>Use your supportive abilities</>}
        description={
          <>
            While you shouldn't aim to cast defensives and externals on cooldown, be aware of them
            and try to use them whenever effective. Not using them at all indicates you might not be
            aware of them enough or not utilizing them optimally.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.DIVINE_STEED_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_STEED_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.DIVINE_PROTECTION_TALENT) && (
          <AbilityRequirement spell={TALENTS.DIVINE_PROTECTION_TALENT.id} />
        )}
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
