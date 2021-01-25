import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import RACES from 'game/RACES';
import { TooltipElement } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const FeralDruidChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const UptimeRequirement = props => (
    <Requirement
      name={(
        <>
          <SpellLink id={props.spell} /> uptime
        </>
      )}
      thresholds={props.thresholds}
    />
  );
  UptimeRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
  };
  const CastEfficiencyRequirement = props => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  CastEfficiencyRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
  };
  const SnapshotDowngradeRequirement = props => (
    <Requirement
      name={(
        <>
          <SpellLink id={props.spell} /> downgraded before the pandemic window
        </>
      )}
      thresholds={props.thresholds}
      tooltip="Downgrading a snapshot can be unavoidable, but you should let the upgraded version last as long as possible by avoiding early refreshes."
    />
  );
  SnapshotDowngradeRequirement.propTypes = {
    spell: PropTypes.object.isRequired,
  };

  return (
    <Checklist>
      {/* Builders
        🗵 Uptime for Rake DoT
        🗵 Uptime for Moonfire DoT (if talented for it)
        ☐ Avoid the types of early refresh which aren't already caught by the snapshot analysers. (Can be tricky to determine with certainty if such a refresh is bad, although if the player is just spamming Rake that should be flagged as a mistake.)
        🗵 Cast efficiency of Brutal Slash (if talented)
        🗵 Cast efficiency of Feral Frenzy (if talented)
        🗵 Only use Swipe if it hits multiple enemies
        🗵 Don't waste combo points by generating more when full
      */}
      <Rule
        name="Generate combo points"
        description={(
          <>
            Builders use energy and give you combo points. Keep your <TooltipElement content="Rake and Moonfire if you have the Lunar Inspiration talent">DoTs</TooltipElement> active, use <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} /> and <SpellLink id={SPELLS.FERAL_FRENZY_TALENT.id} /> if you have those talents, then fill with <SpellLink id={SPELLS.SHRED.id} />. Don't waste combo points by continuing to use builders when at full combo points.<br /><br />

            You should adapt your behaviour in AoE situations (the analyzer only accounts for some of this, so use your discretion when looking at AoE-heavy fights.) If you'll hit 2 or more targets replace <SpellLink id={SPELLS.SHRED.id} /> with <SpellLink id={SPELLS.SWIPE_CAT.id} />. When fighting <TooltipElement content="The threshold varies slightly depending on your stats.">5 targets</TooltipElement> or more it's no longer worth using <SpellLink id={SPELLS.RAKE.id} /> and <SpellLink id={SPELLS.MOONFIRE_FERAL.id} />. Unlike in the Legion expansion you should never spam <SpellLink id={SPELLS.THRASH_FERAL.id} />, only keep it active if you would otherwise be using <SpellLink id={SPELLS.SWIPE_CAT.id} /> on targets without any bleeds.
          </>
        )}
      >
        <UptimeRequirement spell={SPELLS.RAKE.id} thresholds={thresholds.rakeUptime} />
        {combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id) && (
          <UptimeRequirement spell={SPELLS.MOONFIRE_FERAL.id} thresholds={thresholds.moonfireUptime} />
        )}
        {combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id) && (
          <CastEfficiencyRequirement spell={SPELLS.BRUTAL_SLASH_TALENT.id} />
        )}
        {combatant.hasTalent(SPELLS.FERAL_FRENZY_TALENT.id) && (
          <CastEfficiencyRequirement spell={SPELLS.FERAL_FRENZY_TALENT.id} />
        )}
        <Requirement
          name={(
            <>
              Inappropriate <SpellLink id={SPELLS.SWIPE_CAT.id} />
            </>
          )}
          thresholds={thresholds.swipeHitOne}
          tooltip="How many times you used Swipe but had it only hit 1 target. Against a single target you should use Shred instead."
        />
        <Requirement
          name={(
            <>
              Combo points wasted
            </>
          )}
          thresholds={thresholds.comboPointsWaste}
          tooltip="Generating combo points after already reaching the maximum 5 wastes them."
        />
      </Rule>

      {/* Finishers
        🗵 Uptime on Rip DoT
        🗵 Uptime for Savage Roar buff (if talented)
        🗵 Ferocious Bite only at energy >= 50
        🗵 Don't cast Rip when Ferocious Bite could have refreshed it, unless you're upgrading the snapshot
        🗵 Don't reduce duration of Rip by refreshing early and with low combo points
        🗵 Don't use finishers at less than 5 combo points (except for certain exceptions)
      */}
      <Rule
        name="Spend combo points"
        description={(
          <>
            You should generally only use finishers with a full 5 combo points. The exception is the first <SpellLink id={SPELLS.RIP.id} /> of the fight which should be applied as early as possible. <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> is a damage gain in many situations and simplifies your finisher use, allowing you to almost always use <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> as your single target finisher. When casting <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> make sure you have at least <TooltipElement content="Ferocious Bite's tooltip says it needs just 25 energy, but you should always give it an additional 25 to double its damage.">50 energy.</TooltipElement><br /><br />

            <SpellLink id={SPELLS.PRIMAL_WRATH_TALENT.id} /> can replace both <SpellLink id={SPELLS.RIP.id} /> and <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> when against approximately 3 or more enemies.
          </>
        )}
      >
        <UptimeRequirement spell={SPELLS.RIP.id} thresholds={thresholds.ripUptime} />
        {combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id) && (
          <UptimeRequirement spell={SPELLS.SAVAGE_ROAR_TALENT.id} thresholds={thresholds.savageRoarUptime} />
        )}
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> damage bonus from energy
            </>
          )}
          thresholds={thresholds.ferociousBiteEnergy}
          tooltip="Ferocious Bite consumes up to 50 energy, and should always be given that full 50 energy to significantly increase its damage."
        />
        {combatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.RIP.id} /> which should have been <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />
              </>
            )}
            thresholds={thresholds.ripShouldBeBite}
            tooltip="With the Sabertooth talent you can maintain your Rip by using Ferocious Bite. If you instead cast Rip you are missing out on the Ferocious Bite damage. If the replacement Rip has a better snapshot then it may have been worth using, so those cases are not counted here."
          />
        )}
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.RIP.id} /> casts which reduced duration
            </>
          )}
          thresholds={thresholds.ripDurationReduction}
          tooltip="Because Rip's duration is based on combo points used it is possible to reduce the duration of your existing bleed by reapplying it with low combo points. Not only is this a waste of resources but you're doing less damage than you would if you'd done nothing at all."
        />
        <Requirement
          name={(
            <>
              Needless low combo point finishers
            </>
          )}
          thresholds={thresholds.badLowComboFinishers}
          tooltip="Your finishers are most efficient when used with full combo points. However it is still worth using a low combo point Rip if it's not yet up on a target (this exception is detected and taken into account when calculating this metric.)"
        />
      </Rule>

      {/* Manage your energy
        🗵 Don't cap energy
        🗵 Don't waste energy from Tiger's Fury
        ☐ Some kind of check for good pooling behaviour (having high energy when using a finisher is generally good, but would benefit from some research to quantify that effect.)

        Switch out the whole rule section if we can detect that the player was in a situation where energy was abundant.
      */}
      {!thresholds.tigersFuryIgnoreEnergy && (
        <Rule
          name="Manage your energy"
          description={(
            <>
              Your actions are <TooltipElement content="Notable exceptions are when you have the Predator talent with enemies regularly dying, or large AoE situations with certain builds.">usually</TooltipElement> limited by available energy so managing it well is important. Don't let it reach the cap and miss out on regeneration, and avoid wasting generated energy from <SpellLink id={SPELLS.TIGERS_FURY.id} />. Allowing your energy to "pool" before using a finisher is often <TooltipElement content="Using a finisher when at low energy leaves you with little of both your main resources which greatly limits your options. Pooling energy first means you'll have energy left over to react to whatever happens in the fight around you. Although pooling is useful never let your uptime of DoTs and Savage Roar drop because of it.">beneficial</TooltipElement>.
            </>
          )}
        >
          <Requirement
            name={(
              <>
                Wasted natural regeneration from being capped
              </>
            )}
            thresholds={thresholds.energyCapped}
            tooltip="Some waste during Berserk or Incarnation (especially with Bloodlust active) is not a concern. If the fight mechanics force you to not attack for periods of time then capping energy is inevitable. Please use your knowledge of the fight when weighing the importance of this metric."
          />
          <Requirement
            name={(
              <>
                Wasted energy from <SpellLink id={SPELLS.TIGERS_FURY.id} />
              </>
            )}
            thresholds={thresholds.tigersFuryEnergy}
            tooltip="There are some situations where energy is very abundant and the energy gain from Tiger's Fury becomes unimportant, but that is rare in boss fights. Generally you should aim to use Tiger's Fury both for its energy and damage increase."
          />
        </Rule>
      )}
      {thresholds.tigersFuryIgnoreEnergy && combatant.hasTalent(SPELLS.PREDATOR_TALENT.id) && (
        <Rule
          name="Manage your energy"
          description={(
            <>
              Normally your actions are limited by available energy. In this fight you made good use of <SpellLink id={SPELLS.PREDATOR_TALENT.id} /> to allow extra <SpellLink id={SPELLS.TIGERS_FURY.id} /> which makes the usual measures of energy management much less important.
            </>
          )}
        >
          <Requirement
            name={(
              <>
                Additional <SpellLink id={SPELLS.TIGERS_FURY.id} /> from <SpellLink id={SPELLS.PREDATOR_TALENT.id} /> per minute
              </>
            )}
            thresholds={thresholds.predatorWrongTalent}
          />
        </Rule>
      )}

      {/*Use your cooldowns
        🗵 Cast efficiency of Berserk or Incarnation (depending on talent)
        ☐ Make the most of Berserk/Incarnation by using as many abilities as possible during the buff (importance of this may be so low that it's not worth checking - run some simulations to find out)
        🗵 Cast efficiency of Tiger's Fury
        🗵 Shadowmeld for Night Elves: cast efficiency of correctly using it to buff Rake
      */}
      <Rule
        name="Use your cooldowns"
        description={(
          <>
            Aim to use your cooldowns as often as possible, try to get prepared to use the ability when you see it's nearly ready. <SpellLink id={SPELLS.BERSERK.id} /> (or <SpellLink id={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} />) should be used when you have plenty of energy so that you get the most effect from its cost reduction. Make sure you don't cap energy when using <SpellLink id={SPELLS.TIGERS_FURY.id} />, but still use it as often as possible. Slightly delaying one so it lines up with the other can be beneficial, but avoid delaying so much that you'd miss out on an extra use during the fight.
          </>
        )}
      >
        {!combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) && (
          <CastEfficiencyRequirement spell={SPELLS.BERSERK.id} />
        )}
        {combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) && (
          <CastEfficiencyRequirement spell={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} />
        )}
        <CastEfficiencyRequirement spell={SPELLS.TIGERS_FURY.id} />
        {combatant.race === RACES.NightElf && (
          <Requirement
            name={<SpellLink id={SPELLS.SHADOWMELD.id} />}
            thresholds={thresholds.shadowmeld}
            tooltip="This measures how many of the possible uses of Shadowmeld were used to provide the double damage bonus to Rake."
          />
        )}
      </Rule>

      {/*Manage Snapshots
        🗵 Only refresh a Moonfire (if talented) before pandemic if the new one is stronger
        🗵 Only refresh a Rake before pandemic if the new one is stronger
        🗵 Only refresh a Rip before pandemic if the new one is stronger
        🗵 Don't end a Prowl-empowered Rake early by refreshing without that empowerment
      */}
      <Rule
        name="Make the most of snapshots"
        description={(
          <>
            <TooltipElement content="Tiger's Fury affects all DoTs, Bloodtalons affects Ferocious Bite, Rip and Primal Wrath.">Certain buffs</TooltipElement> will increase the damage of your DoTs for their full duration, even after the buff wears off. Making the most of this mechanic can be the difference between good and great results.<br />
            As a general rule it's beneficial to refresh a DoT early if you would increase the snapshot. It's better to refresh with a weaker version of the DoT during the <TooltipElement content="The last 30% of the DoT's duration. If you refresh during this time you don't lose any duration in the process.">pandemic window</TooltipElement> than to let it wear off. The exception is <SpellLink id={SPELLS.RAKE.id} /> empowered by <TooltipElement content="The effect is also provided by Incarnation: King of the Jungle, and Shadowmeld for Night Elves">Prowl</TooltipElement> which is so much stronger that you should wait until the DoT wears off when replacing it with an unbuffed version.<br />
            <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> allows you to use <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> to maintain the existing snapshot on <SpellLink id={SPELLS.RIP.id} /> and should be used to do so.
          </>
        )}
      >
        {combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id) && (
          <SnapshotDowngradeRequirement spell={SPELLS.MOONFIRE_FERAL.id} thresholds={thresholds.moonfireDowngrade} />
        )}
        <SnapshotDowngradeRequirement spell={SPELLS.RAKE.id} thresholds={thresholds.rakeDowngrade} />
        <SnapshotDowngradeRequirement spell={SPELLS.RIP.id} thresholds={thresholds.ripDowngrade} />
        <Requirement
          name={(
            <>
              Average seconds of Prowl-buffed <SpellLink id={SPELLS.RAKE.id} /> lost by refreshing early
            </>
          )}
          thresholds={thresholds.rakeProwlDowngrade}
        />
      </Rule>

      {/*Manage Bloodtalons - whole section is only if talent is taken
        🗵 Use 3 different combo point-generating abilities within 4 seconds to generate charges
        🗵 Don't waste charges by overwriting
        ☐ Use charges on Rip and Ferocious Bite
      */}
      {combatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id) && (
        <Rule
          name="Weave in Bloodtalons"
          description={(
            <>
              Taking the <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> talent adds an extra set of mechanics to weave into your rotation. You should use 3 different combo point-generating abilities within 4 seconds to generate <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> charges which you then spend to buff attacks. Aim to always have the buff active on <SpellLink id={SPELLS.RIP.id} /> and <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />. Pool energy if necessary to generate the buff. While the buff is active, use only <SpellLink id={SPELLS.SHRED.id} /> or <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} /> if talented as combo point generators on single target.
            </>
          )}
        >
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> wasted
              </>
            )}
            thresholds={thresholds.bloodtalonsWasted}
            tooltip="Using Bloodtalons to buff any ability counts as it not being wasted. See the statistics results section for details on how those charges were used."
          />
        </Rule>
      )}

      {/*Pick the right talents (if player is using talents that may be unsuitable)
        🗵 Only use Predator if it's allowing you to reset Tiger's Fury by killing adds
      */}
      {(combatant.hasTalent(SPELLS.PREDATOR_TALENT.id)) && (
        <Rule
          name="Pick the most suitable Talents"
          description={(
            <>
              The <SpellLink id={SPELLS.PREDATOR_TALENT.id} /> talent is generally only effective on fights with multiple enemies and should be swapped out for single target encounters.
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.PREDATOR_TALENT.id) && (
            <Requirement
              name={(
                <>
                  Additional <SpellLink id={SPELLS.TIGERS_FURY.id} /> from <SpellLink id={SPELLS.PREDATOR_TALENT.id} />
                </>
              )}
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
