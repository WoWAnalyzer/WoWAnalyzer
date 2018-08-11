import React from 'react';
import PropTypes from 'prop-types';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'Parser/Core/Modules/Features/Checklist2';
import Rule from 'Parser/Core/Modules/Features/Checklist2/Rule';
import Requirement from 'Parser/Core/Modules/Features/Checklist2/Requirement';
import PreparationRule from 'Parser/Core/Modules/Features/Checklist2/PreparationRule';
import GenericCastEfficiencyRequirement from 'Parser/Core/Modules/Features/Checklist2/GenericCastEfficiencyRequirement';

class ArcaneMageChecklist extends React.PureComponent {
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
            <React.Fragment>
              Using your cooldown abilities as often as possible can help raise your dps significantly. Some help more than others, but as a general rule of thumb you should be looking to use most of your damaging abilities and damage cooldowns as often as possible unless you need to save them for a priority burst phase that is coming up soon.
            </React.Fragment>
          )}
        >
          <AbilityRequirement spell={SPELLS.ARCANE_POWER.id} />
          <AbilityRequirement spell={SPELLS.EVOCATION.id} />
          {combatant.hasTalent(SPELLS.SUPERNOVA_TALENT.id) && <AbilityRequirement spell={SPELLS.SUPERNOVA_TALENT.id} />}
          {combatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id) && <AbilityRequirement spell={SPELLS.ARCANE_ORB_TALENT.id} />}
          {combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id) && <AbilityRequirement spell={SPELLS.MIRROR_IMAGE_TALENT.id} />}
          {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && <AbilityRequirement spell={SPELLS.RUNE_OF_POWER_TALENT.id} />}
          {combatant.hasTalent(SPELLS.NETHER_TEMPEST_TALENT.id) && <AbilityRequirement spell={SPELLS.NETHER_TEMPEST_TALENT.id} />}
          {combatant.hasTalent(SPELLS.CHARGED_UP_TALENT.id) && <AbilityRequirement spell={SPELLS.CHARGED_UP_TALENT.id} />}
        </Rule>
        <Rule
          name="Use Arcane Power effectively"
          description={(
            <React.Fragment>
              Using <SpellLink id={SPELLS.ARCANE_POWER.id} /> properly is one of the most important aspects of playing Arcane well. Therefore it is critical that you make the most of the time that you have while Arcane Power is active. This include things such as not wasting time or GCDs while Arcane Power is active and ensuring that you properly setup for your "burn phase" before hitting Arcane Power.
            </React.Fragment>
          )}
        >
          <Requirement name="Spells Cast During Arcane Power" tooltip="Your cast utilization during Arcane Power. You should be ensuring that you are using the most of the short Arcane Power window and only casting damage abilities like Arcane Blast, Arcane Missiles, and Arcane Explosion." thresholds={thresholds.arcanePowerCasts} />
          <Requirement name="Arcane Power Pre-Cast Setup" tooltip="In order to effectively utilize Arcane Power, there are certain things you need to ensure are setup before you cast Arcane Power. Making sure you have 4 Arcane Charges, You have more than 40% Mana (Unless you have the Overpowered Talent), and ensuring you cast Rune of Power immediately before Arcane Power (if you have Rune of Power talented) will all help make the most out of your burn phase. " thresholds={thresholds.arcanePowerCooldown} />
          <Requirement name="Arcane Power Available on Kill" tooltip="Seeing as the boss is about to die, you should always ensure that Arcane Power is on cooldown when the boss dies. Even if you will only get half the duration out of it you should still cast it to get a boost in damage at the end." thresholds={thresholds.arcanePowerOnKill} />

        </Rule>
        <Rule
          name="Use your talents effectively"
          description="Regardless of which talents you select, you should ensure that you are utilizing them properly. If you are having trouble effectively using a particular talent, you should consider taking a different talent that you can utilize properly or focus on effectively using the talents that you have selected."
        >
          {combatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id && !combatant.hasShoulder(ITEMS.MANTLE_OF_THE_FIRST_KIRIN_TOR.id)) && <Requirement name="Arcane Orb Avg. Hits Per Cast" tooltip="Arcane Orb is primarily an AoE Spell, so you should only choose it on fights with multiple targets but you should still cast it on cooldown even if there is only one target available (unless there is about to be multiple targets). Therefore, on average, your Arcane Orb should hit more than 1 mob per cast." thresholds={thresholds.arcaneOrbAverageHits} />}
          {combatant.hasTalent(SPELLS.RULE_OF_THREES_TALENT.id) && <Requirement name="Rule of Threes Buff Usage" tooltip="Rule of Threes gives you a free cast of Arcane Blast when you hit 3 Arcane Charges so you shoud always ensure you are using that free charge before you clear your Arcane Charges with Barrage since there is no negative mana impact to doing so." thresholds={thresholds.ruleOfThreesUsage} />}
          {combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id) && <Requirement name="Rune of Power Uptime" tooltip="Using Rune of Power effectively means being able to stay within the range of it for it's entire duration. If you are unable to do so or if you frequently have to move out of the range of the buff, consider taking a different talent instead." thresholds={thresholds.runeOfPowerBuffUptime} />}
        </Rule>
        <Rule
          name="Avoid downtime"
          description={(
            <React.Fragment>
              While it's suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and <dfn data-tip="While helping with damage would be optimal, it's much less important as a healer than any of the other suggestions on this checklist. You should ignore this suggestion while you are having difficulties with anything else.">when you're not healing try to contribute some damage*</dfn>.
            </React.Fragment>
          )}
        >
          <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
          <Requirement name="Cancelled Casts" thresholds={thresholds.cancelledCasts} />
        </Rule>
        <Rule
          name="Maintain your buffs"
          description={(
            <React.Fragment>
              You should ensure that you maintain <SpellLink id={SPELLS.ARCANE_INTELLECT.id} /> for the entire fight and recast it whenever you are ressurected and likewise, if you have the appropriate classes/specs in your group you should also ensure that you maintain their buffs as possible. Additionally, you should also maintain other buffs such as <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} /> if you are talented into them.
            </React.Fragment>
          )}
        >
          <Requirement name="Arcane Intellect Uptime" thresholds={thresholds.arcaneIntellectUptime} />
          {combatant.hasTalent(SPELLS.ARCANE_FAMILIAR_TALENT.id) && <Requirement name="Arcane Familiar Uptime" thresholds={thresholds.arcaneFamiliarUptime} />}
        </Rule>
        <Rule
          name={<React.Fragment>Manage your mana</React.Fragment>}
          description={(
            <React.Fragment>
              The biggest aspect of playing Arcane properly is managing your mana effectively. Essentially your mana dictates how much damage you can do and therefore needs to be managed properly. Things such as running out of mana during <SpellLink id={SPELLS.ARCANE_POWER.id} />, letting your mana cap out at 100% for too long, or ending the fight with mana remaining all have negative effects on your DPS. 
            </React.Fragment>
          )}
        >
          <Requirement name="Mana left on boss kill" thresholds={thresholds.manaOnKill} />
          <Requirement name="Arcane Power Mana Mgmt." thresholds={thresholds.arcanePowerManaUtilization} />
          {combatant.hasTalent(SPELLS.TIME_ANOMALY_TALENT.id) && <Requirement name="Time Anomaly Mana Mgmt." thresholds={thresholds.timeAnomalyManaUtilization} />}
        </Rule>
        
        <PreparationRule thresholds={thresholds} />
      </Checklist>
    );
  }
}

export default ArcaneMageChecklist;
