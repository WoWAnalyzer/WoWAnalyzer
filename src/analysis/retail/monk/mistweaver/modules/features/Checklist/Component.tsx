import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import COVENANTS from 'game/shadowlands/COVENANTS';
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

const MistweaverMonkChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use core abilities as often as possible"
        description={
          <>
            As a Mistweaver you only have a single rotational spell that should be cast on CD{' '}
            <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />. The other piece is ensuring you
            have enough <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />
            's on the raid so that you maximize the cleave healing from{' '}
            <SpellLink id={SPELLS.VIVIFY.id} />.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS_MONK.RENEWING_MIST_TALENT.id} />
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> avg per Vivify cast
            </>
          }
          thresholds={thresholds.vivify}
        />
        {combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} />
        )}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <AbilityRequirement spell={SPELLS.FAELINE_STOMP_CAST.id} />
        )}
      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={
          <>
            Your cooldowns are an important contributor to your healing throughput. Try to get in as
            many efficient casts as the fight allows.{' '}
            <a
              href="https://www.peakofserenity.com/sl/mistweaver/pve-guide/"
              target="_blank"
              rel="noopener noreferrer"
            >
              More info.
            </a>
          </>
        }
      >
        {combatant.hasTalent(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.MANA_TEA_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT.id) &&
          !combatant.hasTalent(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id) && (
            <Requirement
              name={
                <>
                  <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> active during{' '}
                  <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} />
                </>
              }
              thresholds={thresholds.renewingMistDuringManaTea}
            />
          )}
        {combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.CHI_BURST_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.CHI_WAVE_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.CHI_WAVE_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.REVIVAL_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.RESTORAL_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.TOUCH_OF_DEATH.id} />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.ENVELOPING_BREATH_HEAL.id} /> applied per{' '}
              <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> cast
            </>
          }
          thresholds={thresholds.envelopingBreath}
        />
        {/* We can't detect race, so disable this when it has never been cast. */}
        {castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA1.id) && (
          <AbilityRequirement spell={SPELLS.ARCANE_TORRENT_MANA1.id} />
        )}
      </Rule>

      <Rule
        name="Position yourself well to maximize your most effective spells"
        description={
          <>
            Effective use of <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> has a big impact
            on your healing. Ensure you stay in melee to maximize the number of targets that can be
            in range of both <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> and other spells
            such as <SpellLink id={TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id} />.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> targets hit
            </>
          }
          thresholds={thresholds.essenceFont}
        />
        {combatant.hasTalent(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id} /> % targets hit
              </>
            }
            thresholds={thresholds.refreshingJadeWind}
          />
        )}
        {combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.CHI_BURST_TALENT.id} /> targets hit
              </>
            }
            thresholds={thresholds.chiBurst}
          />
        )}
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> casts hitting 2 or fewer targets
            </>
          }
          thresholds={thresholds.spinningCraneKick}
        />
      </Rule>

      <Rule
        name="Pick the right tools for the fight"
        description="The throughput gain of some talents might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly."
      >
        {combatant.hasTalent(TALENTS_MONK.SPIRIT_OF_THE_CRANE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.SPIRIT_OF_THE_CRANE_TALENT.id} /> mana returned
              </>
            }
            thresholds={thresholds.spiritOfTheCrane}
          />
        )}

        {combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} /> mana saved
              </>
            }
            thresholds={thresholds.manaTea}
          />
        )}
        {combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id} /> % overhealing
              </>
            }
            thresholds={thresholds.manaTeaOverhealing}
          />
        )}

        {combatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.LIFECYCLES_TALENT.id} /> mana saved
              </>
            }
            thresholds={thresholds.lifecycles}
          />
        )}
        {combatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id) && (
          <Requirement
            name={
              <>
                <SpellLink id={TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> Cast Uptime
              </>
            }
            thresholds={thresholds.jadeSerpentStatue}
          />
        )}
      </Rule>

      <Rule
        name="Use your procs and short CDs"
        description="Make sure to use your procs and spells at the correct time."
      >
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id} /> incorrect casts
            </>
          }
          thresholds={thresholds.thunderFocusTea}
        />
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> cancelled casts
            </>
          }
          thresholds={thresholds.EssenceFontCancelled}
        />
        <Requirement
          name={
            <>
              <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id} /> wasted applications
            </>
          }
          thresholds={thresholds.vivaciousVivification}
        />
      </Rule>

      <Rule
        name="Try to avoid being inactive for a large portion of the fight"
        description={
          <>
            While it's suboptimal to always be casting as a healer you should still try to always be
            doing something during the entire fight and high downtime is inexcusable. You can reduce
            your downtime by reducing the delay between casting spells, anticipating movement,
            moving during the GCD, and{' '}
            <TooltipElement content="While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.">
              when you're not healing try to contribute some damage*
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
        <Requirement
          name={
            <>
              Effective <SpellLink id={TALENTS_MONK.SOOTHING_MIST_TALENT.id} /> Casts
            </>
          }
          thresholds={thresholds.soothingMist}
        />
      </Rule>

      <Rule
        name="Use your defensive cooldowns effectively"
        description="Make sure you use your personal and defensive cooldowns at appropriate times throughout the fight. While it may not make sense to use these abilities on cooldown, saving them for large damage events is ideal."
      >
        {combatant.hasTalent(TALENTS_MONK.FORTIFYING_BREW_SHARED_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.FORTIFYING_BREW_SHARED_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.LIFE_COCOON_TALENT) && (
          <AbilityRequirement spell={TALENTS_MONK.LIFE_COCOON_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.DAMPEN_HARM_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.DAMPEN_HARM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.HEALING_ELIXIR_TALENT.id) && (
          <AbilityRequirement spell={TALENTS_MONK.HEALING_ELIXIR_TALENT.id} />
        )}
      </Rule>
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
};

export default MistweaverMonkChecklist;
