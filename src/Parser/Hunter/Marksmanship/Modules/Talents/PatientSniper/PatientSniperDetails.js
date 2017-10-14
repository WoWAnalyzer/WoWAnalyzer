import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';

import PatientSniperBreakdown from "./PatientSniperBreakdown";
import PatientSniperTracker from "./PatientSniperTracker";

class PatientSniperDetails extends Module {
  static dependencies = {
    patientSniperTracker: PatientSniperTracker,
    combatants: Combatants,
  };

  actualAverageDmgIncrease = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  suggestions(when) {
    const MINOR = 0.18;
    const AVG = 0.17;
    const MAJOR = 0.15;
    when(this.actualAverageDmgIncrease).isLessThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Patient Sniper increases your dmg the later you fire your aimed shots, while this isn't worth waiting for, it looks like you're shooting your Aimed/Piercing Shots too soon, try and use Arcane Shot as a filler after applying Vulnerable. If you have enough haste you can fit in two Arcane Shots, and not only one.`)
          .icon('ability_hunter_snipertraining')
          .actual(`${formatPercentage(this.actualAverageDmgIncrease)}%`)
          .recommended(`It is recommended to be gaining ${formatPercentage(recommended)}% damage`)
          .regular(AVG)
          .major(MAJOR);
      });
  }

  statistic() {
    //calculates the FLAT increase in dmg on average
    const averagePatientSniperDmgIncreaseWithTS = (this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotDmgIncreaseWithTS + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotDmgIncreaseNoTS + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotDmgIncreaseWithTS + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotDmgIncreaseNoTS) / (this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS);
    const averagePSDmgIncreaseAimedOnly = (this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotDmgIncreaseNoTS + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotDmgIncreaseWithTS) / (this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsWithTS + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].aimedShotsNoTS);
    const averagePSDmgIncreasePiercingOnly = (this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotDmgIncreaseNoTS + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotDmgIncreaseWithTS) / (this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsNoTS + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].piercingShotsWithTS);
    //calculates the actual dmg increase compared to not having Patient Sniper with this formula:
    // ((1+(UARanks*0.03)+0.3+0.06*PatientSniper"Ranks")/(1+0.3+(UARanks*0.03)))-1
    this.actualAverageDmgIncrease = ((1 + ((this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing) / 2) + averagePatientSniperDmgIncreaseWithTS) / (1 + ((this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing ) / 2))) - 1;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`+${formatPercentage(this.actualAverageDmgIncrease)}%`}
        label="Avg % dmg change from PS"
        tooltip={` This shows how much your average Aimed Shot and Piercing Shot was increased by compared to how much it would have done without being affected by Patient Sniper. These include Aimed/Piercing Shots fired during Trueshot windows. <br /> Below you'll see them individually, and if you want to see more Patient Sniper information (such as without Trueshot windows), please check the "Patient Sniper Usage" tab in the menu. <br />
Aimed Shot increase: ${formatPercentage(((1 + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + averagePSDmgIncreaseAimedOnly) / (1 + this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed)) - 1)}% <br /> Piercing Shot increase: ${formatPercentage(((1 + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing + averagePSDmgIncreasePiercingOnly) / (1 + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing)) - 1)}% <br />`} />
    );
  }

  tab() {
    return {
      title: 'Patient Sniper Usage',
      url: 'patient-sniper',
      render: () => (
        <Tab title="Patient Sniper Usage Breakdown">
          <PatientSniperBreakdown
            patientSniper={this.patientSniperTracker.patientSniper}
          />
        </Tab>
      ),
    };
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default PatientSniperDetails;
