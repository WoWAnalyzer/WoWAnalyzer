import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import RACES from 'game/RACES';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class FeralDruidChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render() {
    const { combatant, castEfficiency, thresholds } = this.props;

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
    const CastEfficiencyRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );
    const SnapshotDowngradeRequirement = props => (
      <Requirement
        name={(
          <>
            <SpellLink id={props.spell} /> downgraded before the pandemic window
          </>
        )}
        thresholds={props.thresholds}
      />
    );

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
              Builders use energy and give you combo points. Keep your <dfn data-tip={'Rake and Moonfire if you have the Lunar Inspiration talent, and Thrash if you have high levels of Haste and/or Mastery or are fighting multiple enemies.'}>DoTs</dfn> active, use <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} /> and <SpellLink id={SPELLS.FERAL_FRENZY_TALENT.id} /> if you have those talents, then fill with <SpellLink id={SPELLS.SHRED.id} />. Don't waste combo points by continuing to use builders when at full combo points.<br /><br />

              You should adapt your behaviour in AoE situations (note that the analyzer only accounts for some of this, so use your discretion when looking at AoE-heavy fights.) If you'll hit 2 or more targets, keep up the <SpellLink id={SPELLS.THRASH_FERAL.id} /> bleed and replace <SpellLink id={SPELLS.SHRED.id} /> with <SpellLink id={SPELLS.SWIPE_CAT.id} />. When fighting <dfn data-tip={'The threshold varies depending on your stats. Higher haste and mastery means you should continue to use Rake against higher numbers of enemies.'}>5 targets</dfn> or more it's no longer worth using <SpellLink id={SPELLS.RAKE.id} /> and <SpellLink id={SPELLS.MOONFIRE_FERAL.id} />. At <dfn data-tip={'Above 10 to 15 enemies, depending on your haste and mastery'}>very high</dfn> target counts you should stop using <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> and <SpellLink id={SPELLS.RIP.id} /> entirely, as it's more damage to use the energy on <SpellLink id={SPELLS.SWIPE_CAT.id} />. Unlike in the Legion expansion you should never spam <SpellLink id={SPELLS.THRASH_FERAL.id} />.
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
                <SpellLink id={SPELLS.SWIPE_CAT.id} /> that hit only one target
              </>
            )}
            thresholds={thresholds.swipeHitOne}
          />
          <Requirement
            name={(
              <>
                Combo points wasted
              </>
            )}
            thresholds={thresholds.comboPointsWaste}
          />
        </Rule>

        {/* Finishers
          🗵 Uptime on Rip DoT
          🗵 Uptime for Savage Roar buff (if talented)
          🗵 Ferocious Bite only at energy >= 50
          🗵 Don't cast Rip when Ferocious Bite could have refreshed it, unless you're upgrading the snapshot
          🗵 Don't reduce duration of Rip by refreshing early and with low combo points
          🗵 Don't use finishers at less than 5 combo points
        */}
        <Rule
          name="Spend combo points"
          description={(
            <>
              You should generally only use finishers with a full 5 combo points. The exception is the first <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> of a fight, which can be used with fewer. Because it takes time to build combo points some planning is needed to keep <SpellLink id={SPELLS.RIP.id} /> and <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> active all the time. Avoid using resources on <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> if you'll need a more important finisher soon. When you do cast <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> make sure you have at least <dfn data-tip={'Ferocious Bite\'s tooltip says it needs just 25 energy, but you should always give it an additional 25 to double its damage.'}>50 energy.</dfn><br /><br />

              Against <dfn data-tip={'Above 10 to 15 enemies, depending on your haste and mastery'}>very high</dfn> numbers of enemies it becomes more effective to use your energy on <SpellLink id={SPELLS.SWIPE_CAT.id} /> rather than using <SpellLink id={SPELLS.RIP.id} /> or <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />. You should still maintain <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> if you have the talent selected.
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
                Average energy consumed by <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />
              </>
            )}
            thresholds={thresholds.ferociousBiteEnergy}
          />
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.RIP.id} /> which should have been replaced by <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />
              </>
            )}
            thresholds={thresholds.ripShouldBeBite}
          />
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.RIP.id} /> which reduced duration by refreshing early with low combo points
              </>
            )}
            thresholds={thresholds.ripDurationReduction}
          />
          <Requirement
            name={(
              <>
                Finishers used with full combo points
              </>
            )}
            thresholds={thresholds.finishersBelowFull}
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
                Your actions are usually limited by available energy so managing it well is important. Don't let it reach the cap and miss out on regeneration, and avoid wasting generated energy from <SpellLink id={SPELLS.TIGERS_FURY.id} />. Allowing your energy to "pool" before using a finisher is often <dfn data-tip="Using a finisher when at low energy leaves you with little of both your main resources which greatly limits your options. Pooling energy first means you'll have energy left over to react to whatever happens in the fight around you. Although pooling is useful never let your uptime of DoTs and Savage Roar drop because of it.">beneficial</dfn>.
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
            />
              <Requirement
                name={(
                  <>
                    Wasted energy from <SpellLink id={SPELLS.TIGERS_FURY.id} />
                  </>
                )}
                thresholds={thresholds.tigersFuryEnergy}
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
              Aim to use your cooldowns as often as possible, try to get prepared to use the ability when you see it nearing the end of its cooldown. <SpellLink id={SPELLS.BERSERK.id} /> (or <SpellLink id={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} />) should be used when you have plenty of energy so that you get the most effect from its cost reduction. Make sure you don't cap energy when using <SpellLink id={SPELLS.TIGERS_FURY.id} />, but still use it as often as possible. Slightly delaying one so it lines up with the other can be beneficial, but avoid delaying so much that you'd miss out on an extra use during the fight.
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
              <dfn data-tip={'Tiger\'s Fury affects all DoTs, Bloodtalons affects all except Moonfire.'}>Certain buffs</dfn> will increase the damage of your DoTs for their full duration, even after the buff wears off. Making the most of this mechanic can be the difference between good and great results.<br /> 
              As a general rule it's beneficial to refresh a DoT early if you would increase the snapshot. It's better to refresh with a weaker version of the DoT during the <dfn data-tip={'The last 30% of the DoT\'s duration. If you refresh during this time you don\'t lose any duration in the process.'}>pandemic window</dfn> than to let it wear off. The exception is <SpellLink id={SPELLS.RAKE.id} /> empowered by <dfn data-tip={'The effect is also provided by Incarnation: King of the Jungle, and Shadowmeld for Night Elves'}>Prowl</dfn> which is so much stronger that you should wait until the DoT wears off when replacing it with an unbuffed version.
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
          🗵 Use Predatory Swiftness to generate charges
          🗵 Don't waste charges by overwriting
          ☐ Prioritize using charges on Rip and Rake
        */}
        {combatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id) && (
          <Rule 
            name="Weave in Bloodtalons"
            description={(
              <>
                Taking the <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> talent adds an extra set of mechanics to weave into your rotation. You should use every <SpellLink id={SPELLS.PREDATORY_SWIFTNESS.id} /> proc to generate <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> charges, which you then spend to buff attacks. Aim to always have the buff active on <SpellLink id={SPELLS.RIP.id} /> and <SpellLink id={SPELLS.RAKE.id} />. Depending on your other talent choices and the number of targets you'll usually have access to more charges than needed to keep those two DoTs buffed, use the rest to buff other high damage attacks. Choose the right time to cast <SpellLink id={SPELLS.REGROWTH.id} /> or <SpellLink id={SPELLS.ENTANGLING_ROOTS.id} /> and generate charges, a good starting point is to do it whenever you're about to use a finisher.
              </>
            )}
          >
            <Requirement
              name={(
                <>
                  <SpellLink id={SPELLS.PREDATORY_SWIFTNESS.id} /> wasted
                </>
              )}
              thresholds={thresholds.predatorySwiftnessWasted}
            />
            <Requirement
              name={(
                <>
                  <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> wasted
                </>
              )}
              thresholds={thresholds.bloodtalonsWasted}
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
  }
}

export default FeralDruidChecklist;
