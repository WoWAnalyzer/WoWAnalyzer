import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';

const FrostMageChecklist = ({ combatant, castEfficiency, thresholds, owner }: any) => {
  const AbilityRequirement = (props: any) => (
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
        name="Use your cooldowns"
        description={(
          <>
            Using your cooldown abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible unless you need to save them for a priority burst phase that is coming up soon.
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.ICY_VEINS.id} />
        <AbilityRequirement spell={SPELLS.FROZEN_ORB.id} />
        {combatant.hasTalent(SPELLS.EBONBOLT_TALENT.id) && !combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id) && <AbilityRequirement spell={SPELLS.EBONBOLT_TALENT.id} />}
        {combatant.hasTalent(SPELLS.COMET_STORM_TALENT.id) && <AbilityRequirement spell={SPELLS.COMET_STORM_TALENT.id} />}
        {combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id) && <AbilityRequirement spell={SPELLS.MIRROR_IMAGE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && <AbilityRequirement spell={SPELLS.RUNE_OF_POWER_TALENT.id} />}
        {combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id) && <AbilityRequirement spell={SPELLS.RAY_OF_FROST_TALENT.id} />}
        {combatant.hasTalent(SPELLS.ICE_NOVA_TALENT.id) && <AbilityRequirement spell={SPELLS.ICE_NOVA_TALENT.id} />}
      </Rule>
      {owner.build === undefined && (
        <Rule
          name="Shatter your spells"
          description={(
            <>
              The most important element of maximizing the damage of your rotation is ensuring that you are <SpellLink id={SPELLS.SHATTER.id} />ing as many of your spells as possible. The key aspect of this is taking advantage of the <SpellLink id={SPELLS.WINTERS_CHILL.id} /> debuff. Winter's Chill is applied to the target when you use a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc and makes the target act as if it is frozen for a short duration of time. Therefore, you should cast a rotational ability like <SpellLink id={SPELLS.FROSTBOLT.id} />, <SpellLink id={SPELLS.EBONBOLT_TALENT.id} />, or <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} />, followed immediately by the Brain Freeze buffed Flurry and then end with an <SpellLink id={SPELLS.ICE_LANCE.id} />. Against non-boss enemies, you can also utilize other things like <SpellLink id={SPELLS.FROST_NOVA.id} /> or your pet's <SpellLink id={SPELLS.FREEZE.id} /> to shatter spells as well.
            </>
          )}
        >
          <Requirement name="Ice Lance into Winter's Chill" thresholds={thresholds.wintersChillIceLance} tooltip="Using Brain Freeze will apply the Winter's Chill debuff to the target which causes your spells to act as if the target is frozen. Therefore, you should always cast Ice Lance after every instant cast Flurry so that the Ice Lance hits the target while Winter's Chill is up." />
          <Requirement name="Hardcast into Winter's Chill" thresholds={thresholds.wintersChillHardCasts} tooltip="Flurry travels faster than your other spells, so you can pre-cast Frostbolt, Ebonbolt, or Glacial Spike before using your instant cast Flurry. This will result in the pre-cast spell landing in the Winter's Chill debuff and dealing bonus shatter damage." />
        </Rule>
      )}
      {owner.builds.NO_IL.active && (
        <Rule
          name="Shatter your spells"
          description={(
            <>
              The most important element of maximizing the damage of your rotation is ensuring that you are <SpellLink id={SPELLS.SHATTER.id} />ing as many of your spells as possible. The key aspect of this is taking advantage of the <SpellLink id={SPELLS.WINTERS_CHILL.id} /> debuff. Winter's Chill is applied to the target when you use a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc and makes the target act as if it is frozen for a short duration of time. Therefore, you should cast a rotational ability like <SpellLink id={SPELLS.FROSTBOLT.id} />, <SpellLink id={SPELLS.EBONBOLT_TALENT.id} />, or <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} />, followed immediately by the Brain Freeze buffed Flurry. Against non-boss enemies, you can also utilize other things like <SpellLink id={SPELLS.FROST_NOVA.id} /> or your pet's <SpellLink id={SPELLS.FREEZE.id} /> to shatter spells as well.
            </>
          )}
        >
          <Requirement name="Hardcast into Winter's Chill" thresholds={thresholds.wintersChillHardCastsNoIL} tooltip="Flurry travels faster than your other spells, so you can pre-cast Frostbolt, Ebonbolt, or Glacial Spike before using your instant cast Flurry. This will result in the pre-cast spell landing in the Winter's Chill debuff and dealing bonus shatter damage." />
        </Rule>
      )}
      {owner.build === undefined && (
        <Rule
          name="Use your procs effectively"
          description={(
            <>
              Frost Mage revolves almost entirely around utilizing your procs effectively. Therefore it is very important that when you get a proc, you use it quickly and efficiently to prevent them from expiring and to lessen the likelyhood of overwriting them or wasting them. You should aim to use your <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> as quickly as possible to ensure that you do not overcap and to avoid wasting them. Additionally, you should try to ensure that you use all of your Fingers of Frost procs before you use your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc, but sometimes this is not possible. If you are already casting <SpellLink id={SPELLS.FROSTBOLT.id} />, <SpellLink id={SPELLS.EBONBOLT_TALENT.id} />, or <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> and you have both a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> and a <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc, you should prioritize using the Brain Freeze and let the Fingers of Frost proc get wasted.
            </>
          )}
        >
          <Requirement name="Used Brain Freeze procs" thresholds={thresholds.brainFreezeUtilization} tooltip="Your Brain Freeze utilization. Brain Freeze is your most important proc and it is very important that you utilize them properly." />
          <Requirement name="Used Fingers of Frost procs" thresholds={thresholds.fingersOfFrostUtilization} />
        </Rule>
      )}
      {owner.builds.NO_IL.active && (
        <Rule
          name="Use your procs effectively"
          description={(
            <>
              Frost Mage revolves almost entirely around utilizing your procs effectively. Therefore it is very important that when you get a proc, you use it quickly and efficiently to prevent them from expiring and to lessen the likelyhood of overwriting them or wasting them. You should aim to use your <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> as quickly as possible to ensure that you do not overcap and to avoid wasting them. Additionally, you should try to ensure that you use all of your Fingers of Frost procs before you use your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc, but sometimes this is not possible. If you are already casting <SpellLink id={SPELLS.FROSTBOLT.id} />, <SpellLink id={SPELLS.EBONBOLT_TALENT.id} />, or <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> and you have both a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> and a <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc, you should prioritize using the Brain Freeze and let the Fingers of Frost proc get wasted.
            </>
          )}
        >
          <Requirement name="Used Brain Freeze procs" thresholds={thresholds.brainFreezeUtilizationNoIL} tooltip="Your Brain Freeze utilization. Brain Freeze is your most important proc and it is very important that you utilize them properly." />
        </Rule>
      )}
      {owner.build === undefined && (
        <Rule
          name="Use Glacial Spike properly"
          description={(
            <>
              <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> is one of the most impactful talents that you can choose and it plays a large part in your rotation; So you should always ensure that you are getting the most out of it, because a large part of your damage will come from making sure that you are handling Glacial Spike properly. As a rule, once you have Glacial Spike available, you should not cast it unless you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc to use alongside it (<SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> {'>'} <SpellLink id={SPELLS.FLURRY.id} /> {'>'} <SpellLink id={SPELLS.ICE_LANCE.id} />) or if you also have the <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} /> and the Glacial Spike will hit a second target. If neither of those are true, then you should continue casting <SpellLink id={SPELLS.FROSTBOLT.id} /> until you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc. If you are consistently in situations where you are waiting to get a Brain Freeze proc, then consider taking the <SpellLink id={SPELLS.EBONBOLT_TALENT.id} /> talent and saving it for when you need to generate a proc to use with Glacial Spike.
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id) && <Requirement name="Glacial Spike utilization" thresholds={thresholds.glacialSpikeUtilization} />}
        </Rule>
      )}
      {owner.builds.NO_IL.active && (
        <Rule
          name="Use Glacial Spike properly"
          description={(
            <>
              <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> is one of the most impactful talents that you can choose and it plays a large part in your rotation; So you should always ensure that you are getting the most out of it, because a large part of your damage will come from making sure that you are handling Glacial Spike properly. As a rule, once you have Glacial Spike available, you should not cast it unless you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc to use alongside it (<SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> {'>'} <SpellLink id={SPELLS.FLURRY.id} />) or if Glacial Spike will hit the target while you have 5 stacks of <SpellLink id={SPELLS.INCANTERS_FLOW_TALENT.id} />. If neither of those are true, then you should continue casting <SpellLink id={SPELLS.FROSTBOLT.id} /> until you have a <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc. If you are consistently in situations where you are waiting to get a Brain Freeze proc, then consider taking the <SpellLink id={SPELLS.EBONBOLT_TALENT.id} /> talent and saving it for when you need to generate a proc to use with Glacial Spike.
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id) && <Requirement name="Glacial Spike utilization" thresholds={thresholds.glacialSpikeUtilizationNoIL} />}
        </Rule>
      )}
      <Rule
        name="Use your talents effectively"
        description="Regardless of which talents you select, you should ensure that you are utilizing them properly. If you are having trouble effectively using a particular talent, you should consider taking a different talent that you can utilize properly or focus on effectively using the talents that you have selected."
      >
        {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && <Requirement name="Rune of Power uptime" thresholds={thresholds.runeOfPowerBuffUptime} tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, consider taking a different talent instead." />}
        {!combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id) && <Requirement name="Water Elemental utilization" thresholds={thresholds.waterElementalUptime} />}
      </Rule>
      <Rule
        name="Avoid downtime"
        description={(
          <>
            As a DPS, it is important to spend as much time casting as possible since if you arent casting you arent doing damage. Therefore it is important to minimize your movements, stay within range of the target, and try to avoid cancelling casts (unless you have to). While some fights will have an amount of time that is unavoidable downtime; the more you can minimize that downtime, the better.
          </>
        )}
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement name="Cancelled casts" thresholds={thresholds.cancelledCasts} />
      </Rule>
      <PreparationRule thresholds={thresholds}>
        <Requirement name="Arcane Intellect active" thresholds={thresholds.arcaneIntellectUptime} />
      </PreparationRule>
    </Checklist>
  );
};

FrostMageChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasTrinket: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  owner: PropTypes.object.isRequired,
};

export default FrostMageChecklist;
