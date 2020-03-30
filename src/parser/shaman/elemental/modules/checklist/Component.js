import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import SpellLink from 'common/SpellLink';

class ElementalShamanChecklist extends React.PureComponent {
  static propTypes = {
    castEfficiency: PropTypes.object.isRequired,
    combatant: PropTypes.shape({
      hasTalent: PropTypes.func.isRequired,
      hasTrinket: PropTypes.func.isRequired,
    }).isRequired,
    thresholds: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Checklist>
        {this.useCoreAbilitiesRule()}
        {this.minimizeDowntimeRule()}
        {this.maintainFlameShockRule()}
        {this.props.combatant.hasTalent(SPELLS.TOTEM_MASTERY_TALENT_ELEMENTAL.id) ? this.keepYourTotemsUp() : ''}
        {this.props.combatant.hasTalent(SPELLS.ICEFURY_TALENT.id) ? this.maximizeIcefuryRule() : ''}
        {this.props.combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL) ? this.maximizeAscendenceRule():''}
        <PreparationRule thresholds={this.props.thresholds} />
      </Checklist>
    );
  }

  useCoreAbilitiesRule() {
    const AbilityRequirement = props => (
      <GenericCastEfficiencyRequirement castEfficiency={this.props.castEfficiency.getCastEfficiencyForSpellId(props.spell)} {...props} />
    );
    AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

    const description = (
      <>
        Using your core abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible, unless you need to save them for a priority burst phase that is coming up soon.
        {'\u00a0'}
        <a href="https://stormearthandlava.com/guide/general/priority_list.html" target="_blank" rel="noopener noreferrer">More info.</a>
      </>
    );

    const combatant = this.props.combatant;

    return (
      <Rule name="Use core abilities as often as possible" description={description}>
        {combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) && <AbilityRequirement spell={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} />}
        {!combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id) && <AbilityRequirement spell={SPELLS.FIRE_ELEMENTAL.id} />}
        {combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id) && <AbilityRequirement spell={SPELLS.STORM_ELEMENTAL_TALENT.id} />}
        {combatant.hasTalent(SPELLS.ICEFURY_TALENT.id) && <AbilityRequirement spell={SPELLS.ICEFURY_TALENT.id} />}
        {combatant.hasTalent(SPELLS.STORMKEEPER_TALENT.id) && <AbilityRequirement spell={SPELLS.STORMKEEPER_TALENT.id} />}
        {combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id) && <AbilityRequirement spell={SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id} />}
        {combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id) && <AbilityRequirement spell={SPELLS.ELEMENTAL_BLAST_TALENT.id} />}
      </Rule>
    );
  }

  minimizeDowntimeRule() {
    const description = (
      <>
        Downtime is the time where you are not casting and not GCD locked. Ensure you are casting as much as possible by avoiding movement when you could be casting.
        Elemental shaman has many GCDs available from <SpellLink id={SPELLS.EARTH_SHOCK.id} />, <SpellLink id={SPELLS.LAVA_SURGE.id} /> empowered <SpellLink id={SPELLS.LAVA_BURST.id} />s, <SpellLink id={SPELLS.FROST_SHOCK.id} />, and others that help you move towards your location without incurring downtime.
        Additionally, cancelled casts contribute significantly as they fill a GCD without actually doing damage. It's expected that some casts will need to be cancelled due to mechanics, but proper planning can help mitigate that.
      </>
    );

    return (
      <Rule name="Minimize Downtime" description={description} >
        <Requirement name="Downtime" thresholds={this.props.thresholds.downtime} />
        <Requirement name="Cancelled casts" thresholds={this.props.thresholds.cancelledCasts} />
      </Rule>
    );
  }

  maintainFlameShockRule() {
    const description = (
      <>
        It's important to maintain flame shock on your target to guarantee <SpellLink id={SPELLS.LAVA_BURST.id} /> will crit and to allow for <SpellLink id={SPELLS.LAVA_SURGE.id} /> procs.

        Applying <SpellLink id={SPELLS.FLAME_SHOCK.id} /> itself doesn't do much damage so you should only refresh it with 30% (about 7 seconds) or less of it's total duration remaining to beneift from pandemic.
      </>
    );

    return (
      <Rule name="Maintain your flame shock" description={description}>
        <Requirement name={(<><SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime</> )} thresholds={this.props.thresholds.flameShockUptime} />
        <Requirement name={( <> Bad <SpellLink id={SPELLS.FLAME_SHOCK.id} /> refreshes </> )} thresholds={this.props.thresholds.flameShockRefreshes} />
      </Rule>
    );
  }

  keepYourTotemsUp() {
    const description = (
      <>
        <SpellLink id={SPELLS.TOTEM_MASTERY_TALENT_ELEMENTAL.id} /> provides a significant buff at the cost of a GCD. Make sure you keep them up and are within range of them.
        They last for 2 minutes so you should should only need to refresh them a couple times a fight.
      </>
    );

    return (
      <Rule name="Demonstrate Mastery of Totems" description={description}>
        <Requirement name="Totem Uptime" thresholds={this.props.thresholds.totemMasteryUptime} />
      </Rule>
    );
  }

  maximizeIcefuryRule() {

    const description = (
      <>
        <SpellLink id={SPELLS.ICEFURY_TALENT.id} />'s damage component itself is not a strong spell so it's important to fully utilize the talent by consuming all 4 <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> buff stacks with <SpellLink id={SPELLS.FROST_SHOCK.id} /> casts during the buff's duration.
        {this.props.combatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id) && <> While you should try to buff as many <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> empowered <SpellLink id={SPELLS.FROST_SHOCK.id} /> as you can with <SpellLink id={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id} />, it is far more important to actually use all 4 charges before the buff expires.</>}
      </>
    );

    return (
      <Rule name="Utilize all Icefury Stacks" description={description}>
        <Requirement name={<>Average <SpellLink id={SPELLS.FROST_SHOCK.id} /> Casts within <SpellLink id={SPELLS.ICEFURY_TALENT.id} /> Duration</>} thresholds={this.props.thresholds.icefuryEfficiency} />
      </Rule>
    );
  }

  maximizeAscendenceRule() {

    const description = (
      <>
        <SpellLink id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} />'s damage comes from spamming <SpellLink id={SPELLS.LAVA_BURST.id} /> during it's duration. Only use <SpellLink id={SPELLS.LAVA_BURST.id} /> and <SpellLink id={SPELLS.EARTH_SHOCK.id} /> while it is up.
        {this.props.combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) && <> Use <SpellLink id={SPELLS.LAVA_BURST.id} /> as much as you can. Only use <SpellLink id={SPELLS.EARTH_SHOCK.id} /> when you need to spend Malestrom..</>}
      </>
    );

    return (
     <Rule name="Spam Meatballs(Lava Burst)" description={description}>
        <Requirement name={<>"Wrong" Casts within <SpellLink id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} /> Duration</>} thresholds={this.props.thresholds.ascendanceEfficiency} />
     </Rule>
    );
  }
}

export default ElementalShamanChecklist;
