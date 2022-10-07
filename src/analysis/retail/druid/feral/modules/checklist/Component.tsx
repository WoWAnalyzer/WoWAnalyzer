import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PropTypes from 'prop-types';
import * as React from 'react';
import { TALENTS_DRUID } from 'common/TALENTS';

const FeralDruidChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  /** Requirement to maintain a certain uptime for a spell */
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

  /** Requirement to apply a certain 'snapshot' to a DoT or attack */
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

  /** Requirement to keep a spell on cooldown */
  const CastEfficiencyRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  CastEfficiencyRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
  };

  /** Maintain your DoTs
   🗵 Rake DoT uptime
   🗵 Rip DoT uptime
   🗵 (Moonfire DoT uptime)
   🗵 (Adaptive Swarm DoT uptime)
   */
  const maintainYourDotsRule = (
    <Rule
      name="Maintain your DoTs"
      description={
        <>
          Feral is a DoT based spec and as such keeping your DoTs active is very important. Assuming
          the target will survive for its full duration, refreshing a DoT will always result in more
          damage than your direct damage abilities.
        </>
      }
    >
      <UptimeRequirement spell={SPELLS.RIP.id} thresholds={thresholds.ripUptime} />
      <UptimeRequirement spell={SPELLS.RAKE.id} thresholds={thresholds.rakeUptime} />
      {combatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_TALENT.id) && (
        <UptimeRequirement
          spell={SPELLS.MOONFIRE_FERAL.id}
          thresholds={thresholds.moonfireUptime}
        />
      )}
      {combatant.hasTalent(TALENTS_DRUID.ADAPTIVE_SWARM_SHARED_TALENT) && (
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
  );

  /** Snapshot your DoTs
   🗵 Rake TF snapshot
   🗵 Rip TF snapshot
   🗵 (Rip BT snapshot)
   🗵 (Moonfire TF snapshot)
   🗵 Rake prowl overwrite
   */
  const snapshotYourDotsRule = (
    <Rule
      name="Snapshot your DoTs"
      description={
        <>
          Unlike other specs, many Feral buffs 'Snapshot' DoT applications. This means the DoT's
          damage is boosted over its full duration based on the buffs present at time of
          application. You can take advantage of this mechanic by specifically refreshing DoTs when
          snapshotting buffs are active.
          <br />
          <br /> The buffs that have this mechanic are <SpellLink id={SPELLS.TIGERS_FURY.id} />,
          <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />, and{' '}
          <SpellLink id={SPELLS.PROWL.id} /> (with <SpellLink id={SPELLS.RAKE_BLEED.id} />
          ).
        </>
      }
    >
      <SnapshotRequirement
        spell={SPELLS.RIP.id}
        snapshot={SPELLS.TIGERS_FURY.id}
        thresholds={thresholds.ripTfSnapshot}
        tooltip={
          <>
            Where possible, plan your Rip refreshes around the timing of Tiger's Fury - still, 100%
            uptime may not be practical.
          </>
        }
      />
      {combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT.id) && (
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
        tooltip={
          combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT) ? (
            <>
              You may have to use Rake to proc{' '}
              <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} /> and so end up with sub-optimal
              Tiger's Fury snapshotting. Bloodtalons proccing should take precedence over Tiger's
              Fury snapshots.
            </>
          ) : (
            <>
              Where possible, plan to cast Rake near the beginning and end of each Tiger's Fury.
              Cutting off some duration in order to maximize snapshotted time is acceptable.
            </>
          )
        }
      />
      {combatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_TALENT.id) && (
        <SnapshotRequirement
          spell={SPELLS.MOONFIRE_FERAL.id}
          snapshot={SPELLS.TIGERS_FURY.id}
          thresholds={thresholds.moonfireTfSnapshot}
          tooltip={
            combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT) ? (
              <>
                You may have to use Moonfire to proc{' '}
                <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} /> and so end up with
                sub-optimal Tiger's Fury snapshotting. Bloodtalons proccing should take precedence
                over Tiger's Fury snapshots.
              </>
            ) : (
              <>
                Where possible, plan to cast Moonfire near the beginning and end of each Tiger's
                Fury. Cutting off some duration in order to maximize snapshotted time is acceptable.
              </>
            )
          }
        />
      )}
      <Requirement
        name={
          <>
            <SpellLink id={SPELLS.RAKE.id} /> with <SpellLink id={SPELLS.PROWL.id} /> overwrite
            (seconds per minute)
          </>
        }
        thresholds={thresholds.prowlRakeLost}
        tooltip="Stealth (and stealth-like buffs) dramatically empower your Rake's damage. You should
          avoid overwriting one of these empowered Rakes until the last possible moment."
      />
    </Rule>
  );

  /** Finishers
   🗵 Ferocious Bite only at energy >= 50
   🗵 Low CP finishers
   🗵 Rip clipping w/o upgrade
   🗵 (FB BT)
   🗵 (Apex Bites)
   🗵 (SR uptime)
   */
  const finishersRule = (
    <Rule
      name="Use the right finishers"
      description={
        <>
          Most of Feral's damage comes from finishers, so it is very important to use the right one.
          Generally speaking, you should always wait for 5 combo points before using a finisher
          (with the exception of the first <SpellLink id={SPELLS.RIP.id} /> which should be applied
          as quickly as possible).
          <br />
          <br />
          In single target encounters, your finisher priority should be to maintain{' '}
          <SpellLink id={SPELLS.RIP.id} />, and then fill with{' '}
          <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />. In multi-target situations you should use{' '}
          {combatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT) && (
            <>
              <SpellLink id={TALENTS_DRUID.PRIMAL_WRATH_TALENT.id} /> against 3 or more enemies and{' '}
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
            cast full energy bites (with the exception of during Berserk if you have the Soul of the
            Forest talent - this statistic already excludes that exception)"
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
            <SpellLink id={SPELLS.RIP.id} /> duration clipped (seconds per minute)
          </>
        }
        thresholds={thresholds.ripDurationReduction}
        tooltip="Refreshing Rip too early or with low combo points has the potential to clip duration.
            You should only do this when you need to upgrade a snapshot. This statistic only counts
            the times when you clipped without upgrading."
      />
      {combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT) && (
        <SnapshotRequirement
          spell={SPELLS.FEROCIOUS_BITE.id}
          snapshot={SPELLS.BLOODTALONS_BUFF.id}
          thresholds={thresholds.ferociousBiteBloodtalons}
          tooltip="This includes only the Ferocious Bite casts where it was reasonably possible to use Bloodtalons.
              Apex Predator's Craving or Convoke the Spirits could consume procs before you can use them, and during
              Berserk you may not be able to cast enough builders to proc Bloodtalons - these cases aren't counted in this statistic"
        />
      )}
    </Rule>
  );

  /**Use your cooldowns
   🗵 Cast efficiency of Berserk (or Incarnation)
   🗵 Cast efficiency of Tiger's Fury
   🗵 (Cast efficiency of Feral Frenzy)
   🗵 (Cast efficiency of Convoke the Spirits)
   🗵 (Cast efficiency of Kindred Spirits) TODO
   🗵 (Cast efficiency of Ravenous Frenzy) TODO
   🗵 (Cast efficiency of Heart of the Wild)
   */
  const cooldownsRule = (
    <Rule
      name="Use your cooldowns"
      description={
        <>
          Aim to use your cooldowns as often as possible, try to prepare to use the ability when you
          see it's nearly ready.{' '}
          {combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT) ? (
            <SpellLink id={TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id} />
          ) : (
            <SpellLink id={SPELLS.BERSERK.id} />
          )}{' '}
          should be used when you have plenty of energy in order to maximize the number of abilities
          you can use during it. On the other hand, be sure to use energy before using{' '}
          <SpellLink id={SPELLS.TIGERS_FURY.id} /> in order to avoid overcapping, but still use it
          as often as possible. Slightly delaying a cooldown to line up with others or to avoid
          fight mechanics can be beneficial to a point, but avoid delaying so much that you'd miss
          out on an extra use during the fight.
        </>
      }
    >
      {!combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id) && (
        <CastEfficiencyRequirement spell={SPELLS.BERSERK.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id) && (
        <CastEfficiencyRequirement spell={TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id} />
      )}
      <CastEfficiencyRequirement spell={SPELLS.TIGERS_FURY.id} />
      {combatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT.id) && (
        <CastEfficiencyRequirement spell={TALENTS_DRUID.FERAL_FRENZY_TALENT.id} />
      )}
      {combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_SHARED_TALENT) && (
        <CastEfficiencyRequirement spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_SHARED_TALENT.id} />
      )}
      {combatant.race === RACES.NightElf && (
        <Requirement
          name={<SpellLink id={SPELLS.SHADOWMELD.id} />}
          thresholds={thresholds.shadowmeld}
          tooltip="This measures how many of the possible uses of Shadowmeld were used to provide the double damage bonus to Rake."
        />
      )}
    </Rule>
  );

  /** Overall checklist */
  return (
    <Checklist>
      {maintainYourDotsRule}
      {finishersRule}
      {cooldownsRule}
      {snapshotYourDotsRule}
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
