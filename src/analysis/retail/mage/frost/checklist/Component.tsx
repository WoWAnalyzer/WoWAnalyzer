import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule, { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  AbilityRequirementProps,
  ChecklistProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';

const FrostMageChecklist = ({
  combatant,
  castEfficiency,
  thresholds,
  apl,
  checkResults,
}: ChecklistProps & AplRuleProps) => {
  const AbilityRequirement = (props: AbilityRequirementProps) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );

  return (
    <Checklist>
      <Rule
        name="Use your cooldowns"
        description={
          <>
            Using your cooldown abilities as often as possible can help raise your dps
            significantly. Some help more than others, but as a general rule of thumb you should be
            looking to use most of your damaging abilities and damage cooldowns as often as possible
            unless you need to save them for a priority burst phase that is coming up soon.
          </>
        }
      >
        <AbilityRequirement spell={TALENTS.ICY_VEINS_TALENT.id} />
        <AbilityRequirement spell={TALENTS.FROZEN_ORB_TALENT.id} />
        {combatant.hasTalent(TALENTS.EBONBOLT_TALENT.id) &&
          !combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT.id) && (
            <AbilityRequirement spell={TALENTS.EBONBOLT_TALENT.id} />
          )}
        {combatant.hasTalent(TALENTS.COMET_STORM_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.COMET_STORM_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.RUNE_OF_POWER_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.RAY_OF_FROST_TALENT.id} />
        )}
        {combatant.hasTalent(TALENTS.ICE_NOVA_TALENT.id) && (
          <AbilityRequirement spell={TALENTS.ICE_NOVA_TALENT.id} />
        )}
      </Rule>
      <Rule
        name="Shatter your spells"
        description={
          <>
            The most important element of maximizing the damage of your rotation is ensuring that
            you are <SpellLink id={TALENTS.SHATTER_TALENT.id} />
            ing as many of your spells as possible. The key aspect of this is taking advantage of
            the <SpellLink id={SPELLS.WINTERS_CHILL.id} /> debuff. Winter's Chill is applied to the
            target when you use a <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc and makes
            the target act as if it is frozen for a short duration of time. Therefore, you should
            cast a rotational ability like <SpellLink id={SPELLS.FROSTBOLT.id} />,{' '}
            <SpellLink id={TALENTS.EBONBOLT_TALENT.id} />, or{' '}
            <SpellLink id={TALENTS.GLACIAL_SPIKE_TALENT.id} />, followed immediately by the Brain
            Freeze buffed Flurry and then end with two{' '}
            <SpellLink id={TALENTS.ICE_LANCE_TALENT.id} />
            s. Against non-boss enemies, you can also utilize other things like{' '}
            <SpellLink id={SPELLS.FROST_NOVA.id} /> or your pet's{' '}
            <SpellLink id={SPELLS.FREEZE.id} /> to shatter spells as well.
          </>
        }
      >
        <Requirement
          name="Ice Lance into Winter's Chill"
          thresholds={thresholds.wintersChillShatter}
          tooltip="Using Brain Freeze will apply the Winter's Chill debuff to the target which causes your spells to act as if the target is frozen. Therefore, you should always cast Ice Lance twice after every instant cast Flurry so that the Ice Lance hits the target while Winter's Chill is up."
        />
        <Requirement
          name="Hardcast into Winter's Chill"
          thresholds={thresholds.wintersChillHardCasts}
          tooltip="Flurry travels faster than your other spells, so you can pre-cast Frostbolt, Ebonbolt, or Glacial Spike before using your instant cast Flurry. This will result in the pre-cast spell landing in the Winter's Chill debuff and dealing bonus shatter damage. If you are Kyrian, you can also use Radiant Spark instead of a Pre-cast ability."
        />
      </Rule>
      <Rule
        name="Use your procs effectively"
        description={
          <>
            Frost Mage revolves almost entirely around utilizing your procs effectively. Therefore
            it is very important that when you get a proc, you use it quickly and efficiently to
            prevent them from expiring and to lessen the likelyhood of overwriting them or wasting
            them. You should aim to use your <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} />{' '}
            as quickly as possible to ensure that you do not overcap and to avoid wasting them.
            Additionally, you should try to ensure that you use all of your Fingers of Frost procs
            before you use your <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc, but
            sometimes this is not possible. If you are already casting{' '}
            <SpellLink id={SPELLS.FROSTBOLT.id} />, <SpellLink id={TALENTS.EBONBOLT_TALENT.id} />,
            or <SpellLink id={TALENTS.GLACIAL_SPIKE_TALENT.id} /> and you have both a{' '}
            <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> and a{' '}
            <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} /> proc, you should prioritize using
            the Brain Freeze and let the Fingers of Frost proc get wasted.
          </>
        }
      >
        <Requirement
          name="Used Brain Freeze procs"
          thresholds={thresholds.brainFreezeUtilization}
          tooltip="Your Brain Freeze utilization. Brain Freeze is your most important proc and it is very important that you utilize them properly."
        />
        <Requirement
          name="Used Fingers of Frost procs"
          thresholds={thresholds.fingersOfFrostUtilization}
        />
        <Requirement
          name="Munched Fingers of Frost Procs"
          thresholds={thresholds.munchedProcs}
          tooltip="Munching a proc refers to a situation where you have a Fingers of Frost proc at the same time that Winters Chill is on the target. This essentially leads to a wasted Fingers of Frost proc since Fingers of Frost and Winter's Chill both do the same thing, and casting Ice Lance will remove both a Fingers of Frost proc and a stack of Winter's Chill. This is sometimes unavoidable, but if you have both a Fingers of Frost proc and a Brain Freeze proc, you can minimize this by ensuring that you use the Fingers of Frost procs first before you start casting Frostbolt and Flurry to use the Brain Freeze proc."
        />
      </Rule>
      <Rule
        name="Use Glacial Spike properly"
        description={
          <>
            <SpellLink id={TALENTS.GLACIAL_SPIKE_TALENT.id} /> is one of the most impactful talents
            that you can choose and it plays a large part in your rotation; So you should always
            ensure that you are getting the most out of it, because a large part of your damage will
            come from making sure that you are handling Glacial Spike properly. As a rule, once you
            have Glacial Spike available, you should not cast it unless you have a{' '}
            <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc to use alongside it (
            <SpellLink id={TALENTS.GLACIAL_SPIKE_TALENT.id} /> {'>'}{' '}
            <SpellLink id={TALENTS.FLURRY_TALENT.id} /> {'>'}
            <SpellLink id={TALENTS.ICE_LANCE_TALENT.id} />) or if you also have the{' '}
            <SpellLink id={TALENTS.SPLITTING_ICE_TALENT.id} /> and the Glacial Spike will hit a
            second target. If neither of those are true, then you should continue casting{' '}
            <SpellLink id={SPELLS.FROSTBOLT.id} /> until you have a{' '}
            <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc. If you are consistently in
            situations where you are waiting to get a Brain Freeze proc, then consider taking the{' '}
            <SpellLink id={TALENTS.EBONBOLT_TALENT.id} /> talent and saving it for when you need to
            generate a proc to use with Glacial Spike.
          </>
        }
      >
        {combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT.id) && (
          <Requirement
            name="Glacial Spike utilization"
            thresholds={thresholds.glacialSpikeUtilization}
          />
        )}
      </Rule>
      <Rule
        name="Use your talents effectively"
        description="Regardless of which talents you select, you should ensure that you are utilizing them properly. If you are having trouble effectively using a particular talent, you should consider taking a different talent that you can utilize properly or focus on effectively using the talents that you have selected."
      >
        {combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id) && (
          <Requirement
            name="Rune of Power uptime"
            thresholds={thresholds.runeOfPowerBuffUptime}
            tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, consider taking a different talent instead."
          />
        )}
        {!combatant.hasTalent(TALENTS.LONELY_WINTER_TALENT.id) && (
          <Requirement
            name="Water Elemental utilization"
            thresholds={thresholds.waterElementalUptime}
          />
        )}
      </Rule>
      <Rule
        name="Avoid downtime"
        description={
          <>
            As a DPS, it is important to spend as much time casting as possible since if you arent
            casting you arent doing damage. Therefore it is important to minimize your movements,
            stay within range of the target, and try to avoid cancelling casts (unless you have to).
            While some fights will have an amount of time that is unavoidable downtime; the more you
            can minimize that downtime, the better.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
        <Requirement name="Cancelled casts" thresholds={thresholds.cancelledCasts} />
        <Requirement
          name="Active Time during Icy Veins"
          thresholds={thresholds.icyVeinsActiveTime}
        />
      </Rule>
      <AplRule
        name="Use your damaging abilities effectively (Beta APL Check)"
        apl={apl}
        checkResults={checkResults}
        cooldowns={[
          TALENTS.ICY_VEINS_TALENT,
          TALENTS.RUNE_OF_POWER_TALENT,
          SPELLS.MIRRORS_OF_TORMENT,
        ]}
        castEfficiency={castEfficiency}
      />
      <PreparationRule thresholds={thresholds}>
        <Requirement name="Arcane Intellect active" thresholds={thresholds.arcaneIntellectUptime} />
      </PreparationRule>
    </Checklist>
  );
};

export default FrostMageChecklist;
