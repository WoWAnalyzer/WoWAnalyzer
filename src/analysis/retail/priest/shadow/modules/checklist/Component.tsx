import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import { Fragment } from 'react';

const ShadowPriestChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={
        <>
          <SpellLink spell={props.spell} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
    />
  );

  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Maintain your DoTs on the boss"
        description={
          <Fragment>
            It's important to keep your DoTs up on the boss. In addition to dealing damage,{' '}
            <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} />,{' '}
            <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} />, and{' '}
            <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> increase all your damage through{' '}
            <SpellLink spell={SPELLS.MASTERY_SHADOW_WEAVING} />. If you are talented into{' '}
            <SpellLink spell={TALENTS.DARK_EVANGELISM_TALENT} />, do not alter your rotation to
            maintain the effect.
          </Fragment>
        }
      >
        <DotUptime spell={SPELLS.SHADOW_WORD_PAIN} thresholds={thresholds.shadowWordPain} />
        <DotUptime spell={SPELLS.VAMPIRIC_TOUCH} thresholds={thresholds.vampiricTouch} />
        <DotUptime
          spell={TALENTS.DEVOURING_PLAGUE_TALENT}
          thresholds={thresholds.devouringPlague}
        />
        {/**The threshold value of DP needs to be reevalulated for Dragonflight */}

        {combatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT) && (
          <DotUptime
            spell={TALENTS.DARK_EVANGELISM_TALENT}
            thresholds={thresholds.darkEvangelism}
          />
        )}
      </Rule>

      <Rule
        name="Use core spells as often as possible"
        description={
          <Fragment>
            Spells such as these are your most important spells. Try to cast them as much as
            possible.
          </Fragment>
        }
      >
        {combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT) && (
          <AbilityRequirement spell={SPELLS.VOID_BOLT.id} />
        )}

        <AbilityRequirement spell={SPELLS.MIND_BLAST.id} />
        <AbilityRequirement spell={TALENTS.SHADOW_WORD_DEATH_TALENT.id} />

        {combatant.hasTalent(TALENTS.VOID_TORRENT_TALENT) && (
          <AbilityRequirement spell={TALENTS.VOID_TORRENT_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.SHADOW_CRASH_TALENT) && (
          <AbilityRequirement spell={TALENTS.SHADOW_CRASH_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.MINDGAMES_TALENT) && (
          <AbilityRequirement spell={TALENTS.MINDGAMES_TALENT.id} />
        )}
        {/**TODO: Mindgames CD reduction from talents*/}
      </Rule>

      <Rule
        name="Use your procs effectively"
        description={
          <>
            Many talents add procs to increase the power of your abilities. Make sure to use them to
            maximize the damage these talents can give you, and gain extra insanity.
            <br />
          </>
        }
      >
        {combatant.hasTalent(TALENTS.SHADOWY_INSIGHT_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.SHADOWY_INSIGHT_TALENT} /> wasted{' '}
              </>
            }
            thresholds={thresholds.shadowyInsight}
          />
        )}

        {combatant.hasTalent(TALENTS.UNFURLING_DARKNESS_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.UNFURLING_DARKNESS_TALENT} /> wasted{' '}
              </>
            }
            thresholds={thresholds.unfurlingDarkness}
          />
        )}

        {combatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.DEATHSPEAKER_TALENT} /> wasted{' '}
              </>
            }
            thresholds={thresholds.deathspeaker}
          />
        )}

        {combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          !combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT) && (
            <Requirement
              name={
                <>
                  <SpellLink spell={SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE} /> canceled ticks{' '}
                </>
              }
              thresholds={thresholds.mindFlayInsanity}
            />
          )}

        {combatant.hasTalent(TALENTS.SURGE_OF_INSANITY_TALENT) &&
          combatant.hasTalent(TALENTS.MIND_SPIKE_TALENT) && (
            <Requirement
              name={
                <>
                  <SpellLink spell={SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE} /> Procs Wasted{' '}
                </>
              }
              thresholds={thresholds.mindSpikeInsanity}
            />
          )}

        {combatant.hasTalent(TALENTS.MIND_DEVOURER_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS.MIND_DEVOURER_TALENT} /> wasted{' '}
              </>
            }
            thresholds={thresholds.mindDevourer}
          />
        )}
      </Rule>

      <Rule
        name="Use cooldowns effectively"
        description={
          <Fragment>
            Cooldowns are an important part of your rotation, you should be using them as often as
            possible.
          </Fragment>
        }
      >
        {combatant.hasTalent(TALENTS.VOID_ERUPTION_TALENT) && (
          <AbilityRequirement spell={TALENTS.VOID_ERUPTION_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.DARK_ASCENSION_TALENT) && (
          <AbilityRequirement spell={TALENTS.DARK_ASCENSION_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.POWER_INFUSION_TALENT) && (
          <AbilityRequirement spell={TALENTS.POWER_INFUSION_TALENT.id} />
        )}

        {combatant.hasTalent(TALENTS.MINDBENDER_SHADOW_TALENT) ? (
          <AbilityRequirement spell={TALENTS.MINDBENDER_SHADOW_TALENT.id} />
        ) : (
          <AbilityRequirement spell={SPELLS.SHADOWFIEND.id} />
        )}
      </Rule>

      <Rule
        name="Insanity generation"
        description={
          <>
            Insanity generation and management is crucial to maximizing your damage. You should
            always try to stay below maximum insanity for room to generate more with your abilities.
            You should juggle using <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> to not
            overcap while also maximizing DOT uptime for the increased mastery benefit from{' '}
            <SpellLink spell={SPELLS.MASTERY_SHADOW_WEAVING} />.
          </>
        }
      >
        <Requirement name="Insanity Overcapping" thresholds={thresholds.insanityUsage} />
      </Rule>

      <Rule
        name="Minimize casting downtime"
        description={
          <Fragment>
            Try to minimize your time not casting. Use your core spells on cooldown and fillers when
            they are not available. If you know you have an upcoming position requirement,
            stutterstep with each <SpellLink spell={SPELLS.VOID_BOLT} /> or{' '}
            <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} /> cast towards that location. During
            high movement you can use <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> or{' '}
            <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT} /> as a filler.
          </Fragment>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtime} />
      </Rule>

      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ShadowPriestChecklist;
