import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import ConduitLink from 'interface/ConduitLink';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const WindwalkerMonkChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
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
            Spells with short cooldowns like <SpellLink id={SPELLS.RISING_SUN_KICK.id} /> and{' '}
            <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> should be used as often as possible.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.RISING_SUN_KICK.id} />
        <AbilityRequirement spell={SPELLS.FISTS_OF_FURY_CAST.id} />
        {combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.CHI_WAVE_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.CHI_BURST_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Use your procs and short CDs"
        description={
          <>
            Make sure to use your procs and spells at the correct time. Wasting{' '}
            <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs and not hitting all your{' '}
            <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> ticks is a loss of potential damage.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs used
            </>
          }
          thresholds={thresholds.comboBreaker}
        />
        <Requirement
          name={
            <>
              Average ticks hit with <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} />
            </>
          }
          thresholds={thresholds.fistsofFury}
        />
        {combatant.hasLegendary(SPELLS.JADE_IGNITION) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.JADE_IGNITION_BUFF.id} /> stacks used
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
            as possible. <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon /> is both a defensive
            and offensive cooldown, but is mostly used offensively.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.TOUCH_OF_DEATH.id} />
        <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
        {!combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} />
        )}
        {combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.SERENITY_TALENT.id} />
        )}
        <AbilityRequirement spell={SPELLS.INVOKE_XUEN_THE_WHITE_TIGER.id} />
        <Requirement
          name={
            <>
              Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used
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
            <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> and{' '}
            <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} icon /> too much will cause you to delay
            your hard hitting Chi spenders and lose damage.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.EXPEL_HARM.id} />
        {combatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.ENERGIZING_ELIXIR_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id} />
        )}
        <Requirement
          name={
            <>
              Wasted cooldown reduction from <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> per minute
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
            cast and drop the <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} icon /> buff if specced.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.COMBO_STRIKES.id} /> breaks per minute
            </>
          }
          thresholds={thresholds.comboStrikes}
        />
        {combatant.hasTalent(SPELLS.HIT_COMBO_TALENT) && (
          <Requirement
            name={
              <>
                <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> uptime
              </>
            }
            thresholds={thresholds.hitCombo}
          />
        )}
      </Rule>
      {combatant.hasLegendary(SPELLS.LAST_EMPERORS_CAPACITOR) && (
        <Rule
          name={
            <>
              Utilize <SpellLink id={SPELLS.LAST_EMPERORS_CAPACITOR.id} /> effectively
            </>
          }
          description={
            <>
              Use <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id} /> with high stacks and avoid
              wasting stacks by using Chi spenders at cap
            </>
          }
        >
          <Requirement
            name={
              <>
                Average stacks used per <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id} /> cast{' '}
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
      {combatant.hasConduitBySpellID(SPELLS.COORDINATED_OFFENSIVE.id) &&
        !combatant.hasTalent(SPELLS.SERENITY_TALENT.id) && (
          <Rule
            name={
              <>
                Fixate spirits to benefit from <ConduitLink id={SPELLS.COORDINATED_OFFENSIVE.id} />
              </>
            }
            description={
              <>
                If you choose to use the <ConduitLink id={SPELLS.COORDINATED_OFFENSIVE.id} />{' '}
                conduit, you need to use <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_FIXATE.id} /> to
                gain the damage bonus, even if there is only one target. You should fixate as soon
                as you have 5 stacks of <SpellLink id={SPELLS.MARK_OF_THE_CRANE.id} /> or when all
                targets are marked.
              </>
            }
          >
            <Requirement
              name={
                <>
                  Percentage of possible <ConduitLink id={SPELLS.COORDINATED_OFFENSIVE.id} /> damage
                </>
              }
              thresholds={thresholds.coordinatedOffensiveDamageBenefit}
            />
          </Rule>
        )}
      <Rule
        name="Use your defensive cooldowns effectively"
        description={
          <>
            Make sure you use your defensive cooldowns at appropriate times throughout the fight.
            Make sure to use <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> as much as possible to
            maximize its offensive benefit and use <SpellLink id={SPELLS.DIFFUSE_MAGIC_TALENT.id} />
            /<SpellLink id={SPELLS.DAMPEN_HARM_TALENT.id} icon /> for dangerous periods of damage
            intake.
          </>
        }
      >
        <AbilityRequirement spell={SPELLS.TOUCH_OF_KARMA_CAST.id} />
        {combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DIFFUSE_MAGIC_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id) && (
          <AbilityRequirement spell={SPELLS.DAMPEN_HARM_TALENT.id} />
        )}
        <Requirement
          name={
            <>
              Absorb from <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> used
            </>
          }
          thresholds={thresholds.touchOfKarma}
        />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default WindwalkerMonkChecklist;
