import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PropTypes from 'prop-types';
import React from 'react';

import { getHeartOfTheWildSpellId } from '@wowanalyzer/druid/src/core/HeartOfTheWild';

const FeralDruidChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const UptimeRequirement = (props: {
    spell: number;
    thresholds: RequirementThresholds;
    tooltip?: React.ReactNode;
  }) => (
    <Requirement
      name={
        <>
          <SpellLink id={props.spell} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
      tooltip={props.tooltip}
    />
  );
  UptimeRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
    tooltip: PropTypes.object,
  };

  const SnapshotRequirement = (props: {
    spell: number;
    snapshot: number;
    thresholds: RequirementThresholds;
    tooltip?: React.ReactNode;
  }) => (
    <Requirement
      name={
        <>
          <SpellLink id={props.spell} icon /> with <SpellLink id={props.snapshot} icon />
        </>
      }
      thresholds={props.thresholds}
      tooltip={props.tooltip}
    />
  );
  SnapshotRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
    snapshot: PropTypes.object.isRequired,
    tooltip: PropTypes.object,
  };

  const CastEfficiencyRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  CastEfficiencyRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
  };

  const SnapshotDowngradeRequirement = (props: {
    spell: number;
    thresholds: RequirementThresholds;
  }) => (
    <Requirement
      name={
        <>
          <SpellLink id={props.spell} /> downgraded before the pandemic window
        </>
      }
      thresholds={props.thresholds}
      tooltip="Downgrading a snapshot can be unavoidable, but you should let the upgraded version
        last as long as possible by avoiding early refreshes."
    />
  );
  SnapshotDowngradeRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
  };

  return (
    <Checklist>
      {/** Maintain your DoTs
        🗵 Rake DoT uptime
        🗵 Rip DoT uptime
        🗵 (Moonfire DoT uptime)
        🗵 (Adaptive Swarm DoT uptime)
      */}
      <Rule
        name="Maintain your DoTs"
        description={
          <>
            Feral is a DoT based spec and as such keeping your DoTs active is very important.
            Assuming the target will survive for its full duration, refreshing a DoT will always
            result in more damage than your direct damage abilities.
          </>
        }
      >
        <UptimeRequirement spell={SPELLS.RIP.id} thresholds={thresholds.ripUptime} />
        <UptimeRequirement spell={SPELLS.RAKE.id} thresholds={thresholds.rakeUptime} />
        {combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id) && (
          <UptimeRequirement
            spell={SPELLS.MOONFIRE_FERAL.id}
            thresholds={thresholds.moonfireUptime}
          />
        )}
        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && (
          <UptimeRequirement
            spell={SPELLS.ADAPTIVE_SWARM_DAMAGE.id}
            thresholds={thresholds.adaptiveSwarmUptime}
            tooltip={`100% Adaptive Swarm uptime isn't practically possible due to its cooldown
              and mechanics. On a single target fight you should NOT be using it on cooldown,
              as you'll clip the 2nd bounce. Instead, wait for the 2nd bounce to reach
              its refresh window.`}
          />
        )}
      </Rule>

      {/** Snapshot your DoTs
       🗵 Rake TF snapshot
       🗵 Rip TF snapshot
       🗵 (Rip BT snapshot)
       🗵 (Moonfire TF snapshot)
       TODO add Rake Prowl overwrites
       */}
      <Rule
        name="Snapshot your DoTs"
        description={
          <>
            Unlike other specs, many Feral buffs 'Snapshot' DoT applications. This means the DoT's
            damage is boosted over its full duration based on the buffs present at time of
            application. You can take advantage of this mechanic by specifically refreshing DoTs
            when snapshotting buffs are active.
            <br />
            <br /> The buffs that have this mechanic are <SpellLink id={SPELLS.TIGERS_FURY.id} />,
            <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} />, and <SpellLink id={SPELLS.PROWL.id} />{' '}
            (with <SpellLink id={SPELLS.RAKE_BLEED.id} />
            ).
          </>
        }
      >
        <SnapshotRequirement
          spell={SPELLS.RIP.id}
          snapshot={SPELLS.TIGERS_FURY.id}
          thresholds={thresholds.ripTfSnapshot}
        />
        {combatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id) && (
          <SnapshotRequirement
            spell={SPELLS.RIP.id}
            snapshot={SPELLS.BLOODTALONS_BUFF.id}
            thresholds={thresholds.ripBtSnapshot}
          />
        )}
        <SnapshotRequirement
          spell={SPELLS.RAKE.id}
          snapshot={SPELLS.TIGERS_FURY.id}
          thresholds={thresholds.rakeTfSnapshot}
        />
        {combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id) && (
          <SnapshotRequirement
            spell={SPELLS.MOONFIRE_FERAL.id}
            snapshot={SPELLS.TIGERS_FURY.id}
            thresholds={thresholds.moonfireTfSnapshot}
          />
        )}
      </Rule>

      {/** Finishers
        🗵 Ferocious Bite only at energy >= 50
        🗵 Low CP finishers
        🗵 Rip clipping w/o upgrade
        🗵 (FB BT)
        🗵 (Apex Bites)
        🗵 (SR uptime)
      */}
      <Rule
        name="Use the right finishers"
        description={
          <>
            Most of Feral's damage comes from finishers, so it is very important to use the right
            one. Generally speaking, you should always wait for 5 combo points before using a
            finisher (with the exception of the first <SpellLink id={SPELLS.RIP.id} /> which should
            be applied as quickly as possible).
            <br />
            <br />
            In single target encounters, your finisher priority should be to{' '}
            {combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT) && (
              <>
                maintain <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} />,{' '}
              </>
            )}
            maintain <SpellLink id={SPELLS.RIP.id} />, and then fill with{' '}
            <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />. In multi-target situations you should use{' '}
            {combatant.hasTalent(SPELLS.PRIMAL_WRATH_TALENT) && (
              <>
                <SpellLink id={SPELLS.PRIMAL_WRATH_TALENT.id} /> against 3 or more enemies and{' '}
              </>
            )}
            <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> on targets that die too quickly for Rip to
            tick.
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> extra energy use
            </>
          }
          thresholds={thresholds.ferociousBiteEnergy}
          tooltip="In addition to its base cost of 25 energy, Ferocious Bite consumes up to
            an additional 25 energy to significantly increase its damage. You should aim to always
            cast full energy bites."
        />
        <Requirement
          name={<>Low Combo Point finishers</>}
          thresholds={thresholds.badLowComboFinishers}
          tooltip="Your finishers should always be cast with full combo points.
            The only exception is using a low CP Rip if it's not yet up on a target
            (this exception is detected and taken into account when calculating this metric.)"
        />
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.RIP.id} /> casts which reduced duration
            </>
          }
          thresholds={thresholds.ripDurationReduction}
          tooltip="Refreshing Rip too early or with low combo points has the potential to lose duration.
            You should only do this when you need to upgrade a snapshot."
        />
        {/* TODO double check this threshold and update to 'seconds clipped per minute'*/}

        {combatant.hasTalent(SPELLS.BLOODTALONS_TALENT) && (
          <SnapshotRequirement
            spell={SPELLS.FEROCIOUS_BITE.id}
            snapshot={SPELLS.BLOODTALONS_BUFF.id}
            thresholds={thresholds.ripBtSnapshot}
          />
        )}
        {/* TODO PLACEHOLDER THRESHOLD! UPDATE! */}
        {/* TODO update Bloodtalons module to check for percent of FBs buffed by BT*/}

        {combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id) && (
          <UptimeRequirement
            spell={SPELLS.SAVAGE_ROAR_TALENT.id}
            thresholds={thresholds.savageRoarUptime}
          />
        )}
      </Rule>

      {/** Spend your Resources
        🗵 Natural energy overcap
        🗵 TF energy overcap
        🗵 CP overcap
       */}
      <Rule
        name="Spend your resources"
        description={
          <>
            Your actions are limited by energy and combo points, so it is wasteful to allow yourself
            to go overcap on either of them. "Pooling" energy is often valuable as it gives you more
            leeway to react to fight mechanics, but you should never do so at the expense of letting
            uptimes drop or going overcap.
          </>
        }
      >
        <Requirement
          name={<>Energy Overcap from regeneration (per minute)</>}
          thresholds={thresholds.energyCapped}
          tooltip="Some energy overcap can happen due to periods of extremely high regeneration
            or due to being forced off target by fight mechanics. Please use your knowledge of the
            fight when weighing the importance of this metric."
        />
        {/* TODO double check this threshold */}
        <Requirement
          name={
            <>
              Energy Overcap from <SpellLink id={SPELLS.TIGERS_FURY.id} /> (per minute)
            </>
          }
          thresholds={thresholds.tigersFuryEnergy}
          tooltip="Remember that Tiger's Fury generates instant energy which should not be wasted.
            Plan for it coming off cooldown by spending down your energy."
        />
        {/* TODO double check this threshold */}
        <Requirement
          name={<>Combo Point Overcap (per minute)</>}
          thresholds={thresholds.comboPointsWaste}
          tooltip="Your finishing moves are much more powerful than your combo builders. When at
          max CPs you should always use a finisher over a combo builder. This stat does not include
          the accidental overcap due to getting a crit when at 4 CPs, as this is unavoidable."
        />
        {/* TODO double check this threshold */}
      </Rule>

      {/**Use your cooldowns
        🗵 Cast efficiency of Berserk or Incarnation (depending on talent)
        ☐ Make the most of Berserk/Incarnation by using as many abilities as possible during the buff
          (importance of this may be so low that it's not worth checking - run some simulations to find out)
        🗵 Cast efficiency of Tiger's Fury
        🗵 Shadowmeld for Night Elves: cast efficiency of correctly using it to buff Rake
      */}
      <Rule
        name="Use your cooldowns"
        description={
          <>
            Aim to use your cooldowns as often as possible, try to get prepared to use the ability
            when you see it's nearly ready. <SpellLink id={SPELLS.BERSERK.id} /> (or{' '}
            <SpellLink id={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} />) should be used when
            you have plenty of energy so that you get the most effect from its cost reduction. Make
            sure you don't cap energy when using <SpellLink id={SPELLS.TIGERS_FURY.id} />, but still
            use it as often as possible. Slightly delaying one so it lines up with the other can be
            beneficial, but avoid delaying so much that you'd miss out on an extra use during the
            fight.
          </>
        }
      >
        {!combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) && (
          <CastEfficiencyRequirement spell={SPELLS.BERSERK.id} />
        )}
        {combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) && (
          <CastEfficiencyRequirement spell={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} />
        )}
        <CastEfficiencyRequirement spell={SPELLS.TIGERS_FURY.id} />
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && (
          <CastEfficiencyRequirement spell={SPELLS.CONVOKE_SPIRITS.id} />
        )}
        {combatant.hasTalent(SPELLS.HEART_OF_THE_WILD_TALENT.id) && (
          <CastEfficiencyRequirement spell={getHeartOfTheWildSpellId(combatant)} />
        )}
        {combatant.race === RACES.NightElf && (
          <Requirement
            name={<SpellLink id={SPELLS.SHADOWMELD.id} />}
            thresholds={thresholds.shadowmeld}
            tooltip="This measures how many of the possible uses of Shadowmeld were used to provide the double damage bonus to Rake."
          />
        )}
      </Rule>

      {/*Pick the right talents (if player is using talents that may be unsuitable)
        🗵 Only use Predator if it's allowing you to reset Tiger's Fury by killing adds
      */}
      {combatant.hasTalent(SPELLS.PREDATOR_TALENT.id) && (
        <Rule
          name="Pick the most suitable Talents"
          description={
            <>
              The <SpellLink id={SPELLS.PREDATOR_TALENT.id} /> talent is generally only effective on
              fights with multiple enemies and should be swapped out for single target encounters.
            </>
          }
        >
          {combatant.hasTalent(SPELLS.PREDATOR_TALENT.id) && (
            <Requirement
              name={
                <>
                  Additional <SpellLink id={SPELLS.TIGERS_FURY.id} /> from{' '}
                  <SpellLink id={SPELLS.PREDATOR_TALENT.id} />
                </>
              }
              thresholds={thresholds.predatorWrongTalent}
            />
          )}
        </Rule>
      )}

      {/*Be prepared
        🗵 Universal rules for using potions, enchants, etc.
      */}
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

FeralDruidChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    race: PropTypes.any,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default FeralDruidChecklist;
