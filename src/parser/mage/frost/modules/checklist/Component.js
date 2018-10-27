import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist2';
import Rule from 'parser/shared/modules/features/Checklist2/Rule';
import Requirement from 'parser/shared/modules/features/Checklist2/Requirement';
import PreparationRule from 'parser/shared/modules/features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist2/GenericCastEfficiencyRequirement';

class FrostMageChecklist extends React.PureComponent {
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

    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement
        castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
        {...props}
      />
    );

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
        <Rule
          name="Use your procs effectively"
          description={(
            <>
              Frost Mage revolves almost entirely around utilizing your procs effectively. Therefore it is very important that when you get a proc, you use it correctly to prevent them from expiring and to lessen the likelyhood of overwriting them or wasting them.
            </>
          )}
        >
          <Requirement name="Used Brain Freeze Procs" thresholds={thresholds.brainFreezeUtilization} tooltip="Your Brain Freeze Utilization. Brain Freeze is your most important proc and it is very important that you utilize them properly." />
          <Requirement name="Used Fingers of Frost Procs" thresholds={thresholds.fingersOfFrostUtilization} />
          <Requirement name="Ice Lance into Winter's Chill" thresholds={thresholds.wintersChillIceLance} tooltip="Using Brain Freeze will apply the Winter's Chill Debuff to the target which causes your spells to act as if the target is frozen. Therefore, you should always cast Ice Lance after every instant cast Flurry so that the Ice Lance hits the target while Winter's Chill is up." />
          <Requirement name="Hardcast into Winter's Chill" thresholds={thresholds.wintersChillHardCasts} tooltip="Flurry travels faster than your other spells, so you can pre-cast Frostbolt, Ebonbolt, or Glacial Spike before using your instant cast Flurry. This will result in the pre-cast spell landing in the Winter's Chill Debuff and dealing bonus shatter damage." />
          {combatant.hasTrait(SPELLS.WINTERS_REACH_TRAIT.id) && <Requirement name="Winter's Reach Utilization" thresholds={thresholds.wintersReachUtilization} tooltip="The Winter's Reach azerite trait gives you a chance to make your next non instant Flurry deal extra damage (similar to Pyroclasm for Fire Mage). Make sure you are using these procs to get some extra damage or if you are unable to use these buffs effectively, then consider taking a different trait." />}
        </Rule>
        <Rule
          name="Use your talents effectively"
          description="Regardless of which talents you select, you should ensure that you are utilizing them properly. If you are having trouble effectively using a particular talent, you should consider taking a different talent that you can utilize properly or focus on effectively using the talents that you have selected."
        >
          {combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id) && <Requirement name="Glacial Spike Utilization" thresholds={thresholds.glacialSpikeUtilization} />}
          {combatant.hasTalent(SPELLS.THERMAL_VOID_TALENT.id) && <Requirement name="Thermal Void Avg Duration" thresholds={thresholds.thermalVoidDuration} tooltip="Thermal Void adds time to your Icy Veins every time you cast an Ice Lance that benefits from Shatter (this includes Fingers of Frost proc usage and Ice Lance's that land in Winter's Chill). Maximizing this uptime will increase your damage." />}
          {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && <Requirement name="Rune of Power Uptime" thresholds={thresholds.runeOfPowerBuffUptime} tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, consider taking a different talent instead." />}
          {!combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id) && <Requirement name="Water Elemental Utilization" thresholds={thresholds.waterElementalUptime} />}
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
          <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
        </Rule>
        <Rule
          name="Maintain your buffs"
          description={(
            <>
              You should ensure that you maintain <SpellLink id={SPELLS.ARCANE_INTELLECT.id} /> for the entire fight and recast it whenever you are ressurected and likewise, if you have the appropriate classes/specs in your group you should also ensure that you maintain their buffs as possible. Additionally, you should also ensure that you are maximizing your uptime of <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /> if you are talented into it.
            </>
          )}
        >
          <Requirement name="Arcane Intellect Uptime" thresholds={thresholds.arcaneIntellectUptime} />
          {combatant.hasTalent(SPELLS.BONE_CHILLING_TALENT.id) && <Requirement name="Bone Chilling Uptime" thresholds={thresholds.boneChillingUptime} />}
        </Rule>
        
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default FrostMageChecklist;
