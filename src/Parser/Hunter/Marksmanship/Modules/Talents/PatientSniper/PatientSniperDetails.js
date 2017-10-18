import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';

import PatientSniperBreakdown from "./PatientSniperBreakdown";
import PatientSniperTracker from "./PatientSniperTracker";

const VULNERABLE_BONUS = 0.3;
const UNERRING_ARROWS_BONUS_PER_RANK = 0.03;

class PatientSniperDetails extends Module {
  static dependencies = {
    patientSniperTracker: PatientSniperTracker,
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  hasPiercingShot = false;
  vulnerableModifier = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
    this.hasPiercingShot = this.combatants.selected.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id);
    const unerringArrowsRank = this.combatants.selected.traitsBySpellId[SPELLS.UNERRING_ARROWS_TRAIT.id];
    this.vulnerableModifier = VULNERABLE_BONUS + unerringArrowsRank * UNERRING_ARROWS_BONUS_PER_RANK;
  }

  get bonusAimedDamage() {
    return this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].bonusDmg;
  }
  get bonusPiercingDamage() {
    return this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].bonusDmg;
  }
  get bonusDamage() {
    return this.bonusAimedDamage + this.bonusPiercingDamage;
  }

  suggestions(when) {
    const bonusDamagePercentage = this.owner.getPercentageOfTotalDamageDone(this.bonusDamage);
    const MINOR = 0.18;
    const AVG = 0.17;
    const MAJOR = 0.15;
    when(bonusDamagePercentage).isLessThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span><SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id}/> increases the damage of your <SpellLink id={SPELLS.AIMED_SHOT.id}/> or <SpellLink id={SPELLS.PIERCING_SHOT_TALENT.id}/> the later you fire them inside <SpellLink id={SPELLS.VULNERABLE.id}/>. While this isn't worth waiting for, it looks like you're shooting your Aimed Shots / Piercing Shots too soon, try and use <SpellLink id={SPELLS.ARCANE_SHOT.id}/> as a filler after applying Vulnerable. If you have enough haste you can fit in two Arcane Shots instead of one.</span>)
          .icon('ability_hunter_snipertraining')
          .actual(`${formatPercentage(actual)}% bonus damage`)
          .recommended(`> ${formatPercentage(recommended)}% bonus damage is recommended`)
          .regular(AVG)
          .major(MAJOR);
      });
  }

  statistic() {
    let tooltipText = `Your Aimed Shots and Piercing Shots did ${formatNumber(this.bonusDamage)} (${this.owner.formatItemDamageDone(this.bonusDamage)}) bonus damage thanks to Patient Sniper talent. Below you'll see them individually, and if you want to see more Patient Sniper information (such as without Trueshot windows), please check the "Patient Sniper Usage" tab in the menu. <br />`;
    const aimed = this.abilityTracker.getAbility(SPELLS.AIMED_SHOT.id);
    tooltipText += `Aimed Shot bonus damage: ${formatNumber(this.bonusAimedDamage)} (${formatPercentage(this.bonusAimedDamage / aimed.damageEffective)} %)`;
    if (this.hasPiercingShot) {
      const piercing = this.abilityTracker.getAbility(SPELLS.PIERCING_SHOT_TALENT.id);
      tooltipText += `<br />Piercing Shot bonus damage: ${formatNumber(this.bonusPiercingDamage)} (${formatPercentage(this.bonusPiercingDamage / piercing.damageEffective)} %)`;
    }
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}%`}
        label="Patient Sniper bonus damage"
        tooltip={tooltipText} />
    );
  }

  tab() {
    return {
      title: 'Patient Sniper Usage',
      url: 'patient-sniper',
      render: () => (
        <Tab title="Patient Sniper Usage Breakdown">
          <PatientSniperBreakdown
            vulnerableModifier={this.vulnerableModifier}
            patientSniper={this.patientSniperTracker.patientSniper}
            hasPiercingShot={this.hasPiercingShot}
          />
        </Tab>
      ),
    };
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default PatientSniperDetails;
