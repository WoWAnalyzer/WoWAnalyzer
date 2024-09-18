import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import { TALENTS_MONK } from 'common/TALENTS';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';

interface WWAplProps {
  aplProps: AplRuleProps;
}

const WindwalkerMonkChecklist = (props: ChecklistProps & WWAplProps) => {
  const { combatant, castEfficiency, thresholds } = props;
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
            Spells with short cooldowns like{' '}
            <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> and{' '}
            <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} /> should be used as often as possible.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} />
        <AbilityRequirement spell={SPELLS.FISTS_OF_FURY_CAST.id} />
        {combatant.hasTalent(TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT) && (
          <AbilityRequirement spell={SPELLS.WHIRLING_DRAGON_PUNCH_DAMAGE.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT) && (
          <AbilityRequirement spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your procs and short CDs"
        description={
          <>
            Make sure to use your procs and spells at the correct time. Wasting{' '}
            <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> procs and not hitting all your{' '}
            <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} /> ticks is a loss of potential damage.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> procs used
            </>
          }
          thresholds={thresholds.comboBreaker}
        />
        <Requirement
          name={
            <>
              Average ticks hit with <SpellLink spell={SPELLS.FISTS_OF_FURY_CAST} />
            </>
          }
          thresholds={thresholds.fistsofFury}
        />
        {false && (
          <Requirement
            name={
              <>
                <SpellLink spell={SPELLS.JADE_IGNITION_BUFF} /> stacks used
              </>
            }
            thresholds={thresholds.jadeIgnition}
          />
        )}
      </Rule>
      <Rule
        name="Use your cooldowns effectively"
        description={
          <>
            Your cooldowns have a big impact on your damage output. Make sure you use them as much
            as possible. <SpellLink spell={SPELLS.TOUCH_OF_KARMA_CAST} icon /> is both a defensive
            and offensive cooldown, but is mostly used offensively.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.TOUCH_OF_DEATH.id} />
        <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
        {combatant.hasTalent(TALENTS_MONK.STORM_EARTH_AND_FIRE_TALENT) && (
          <AbilityRequirement spell={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} />
        )}
        <AbilityRequirement spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id} />
        <Requirement
          name={
            <>
              Absorb from <SpellLink spell={SPELLS.TOUCH_OF_KARMA_CAST} /> used
            </>
          }
          thresholds={thresholds.touchOfKarma}
        />
      </Rule>
      <Rule
        name="Manage your resources"
        description={
          <>
            Windwalker is heavily dependent on having enough Chi to cast your core spells on
            cooldown. Wasting Chi either by generating while capped or using{' '}
            <SpellLink spell={SPELLS.BLACKOUT_KICK} icon /> and{' '}
            <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} icon /> too much will cause you to delay
            your hard hitting Chi spenders and lose damage.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.EXPEL_HARM.id} />
        <Requirement
          name={
            <>
              Wasted cooldown reduction from <SpellLink spell={SPELLS.BLACKOUT_KICK} /> per minute
            </>
          }
          thresholds={thresholds.blackoutKick}
        />
        <Requirement name="Chi wasted per minute" thresholds={thresholds.chiDetails} />
      </Rule>
      <Rule
        name="Don't break mastery"
        description={
          <>
            Using the same damaging ability twice in a row will lose mastery benefit on the second
            cast and drop the <SpellLink spell={TALENTS_MONK.HIT_COMBO_TALENT} icon /> buff if
            specced.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.COMBO_STRIKES} /> breaks per minute
            </>
          }
          thresholds={thresholds.comboStrikes}
        />
        {combatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink spell={TALENTS_MONK.HIT_COMBO_TALENT} /> uptime
              </>
            }
            thresholds={thresholds.hitCombo}
          />
        )}
      </Rule>
      {false && (
        <Rule
          name={
            <>
              Utilize <SpellLink spell={TALENTS_MONK.LAST_EMPERORS_CAPACITOR_TALENT} /> effectively
            </>
          }
          description={
            <>
              Use <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> with high stacks and avoid
              wasting stacks by using Chi spenders at cap
            </>
          }
        >
          <Requirement
            name={
              <>
                Average stacks used per <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> cast{' '}
              </>
            }
            thresholds={thresholds.lastEmperorsCapacitorAverageStacks}
          />
          <Requirement
            name="Stacks wasted per minute"
            thresholds={thresholds.lastEmperorsCapacitorWastedStacks}
          />
        </Rule>
      )}
      {/*{false && !combatant.hasTalent(TALENTS_MONK.SERENITY_TALENT) && (*/}
      {/*  <Rule*/}
      {/*    name={*/}
      {/*      <>*/}
      {/*        Fixate spirits to benefit from <SpellLink spell={SPELLS.COORDINATED_OFFENSIVE.id} />*/}
      {/*      </>*/}
      {/*    }*/}
      {/*    description={*/}
      {/*      <>*/}
      {/*        If you choose to use the <SpellLink spell={SPELLS.COORDINATED_OFFENSIVE.id} /> conduit,*/}
      {/*        you need to use <SpellLink spell={SPELLS.STORM_EARTH_AND_FIRE_FIXATE.id} /> to gain the*/}
      {/*        damage bonus, even if there is only one target. You should fixate as soon as you have*/}
      {/*        5 stacks of <SpellLink spell={SPELLS.MARK_OF_THE_CRANE.id} /> or when all targets are*/}
      {/*        marked.*/}
      {/*      </>*/}
      {/*    }*/}
      {/*  >*/}
      {/*    <Requirement*/}
      {/*      name={*/}
      {/*        <>*/}
      {/*          Percentage of possible <SpellLink spell={SPELLS.COORDINATED_OFFENSIVE.id} /> damage*/}
      {/*        </>*/}
      {/*      }*/}
      {/*      thresholds={thresholds.coordinatedOffensiveDamageBenefit}*/}
      {/*    />*/}
      {/*  </Rule>*/}
      {/*)}*/}
      <Rule
        name="Use your defensive cooldowns effectively"
        description={
          <>
            Make sure you use your defensive cooldowns at appropriate times throughout the fight.
            Make sure to use <SpellLink spell={SPELLS.TOUCH_OF_KARMA_CAST} /> as much as possible to
            maximize its offensive benefit and use{' '}
            <SpellLink spell={TALENTS_MONK.DIFFUSE_MAGIC_TALENT} />
            /<SpellLink spell={TALENTS_MONK.DAMPEN_HARM_TALENT} icon /> for dangerous periods of
            damage intake.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
        {combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT) && (
          <AbilityRequirement spell={TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS_MONK.DAMPEN_HARM_TALENT) && (
          <AbilityRequirement spell={TALENTS_MONK.DAMPEN_HARM_TALENT.id} />
        )}
        <Requirement
          name={
            <>
              Absorb from <SpellLink spell={SPELLS.TOUCH_OF_KARMA_CAST} /> used
            </>
          }
          thresholds={thresholds.touchOfKarma}
        />
      </Rule>
      <AplRule
        name="Core Rotation"
        castEfficiency={props.castEfficiency}
        {...props.aplProps}
        description={
          <>
            This section measures the quality of your rotation outside of{' '}
            <SpellLink spell={TALENTS_MONK.STORM_EARTH_AND_FIRE_TALENT} /> is active. See the{' '}
            <a href="https://www.peakofserenity.com/df/windwalker/pve-guide/">
              Peak of Serenity Guide
            </a>{' '}
            for more information.
            <p>For now, this rotation assumes a single target.</p>
          </>
        }
      />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default WindwalkerMonkChecklist;
