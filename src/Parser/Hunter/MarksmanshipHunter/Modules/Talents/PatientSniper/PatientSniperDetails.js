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



  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  suggestions(when) {
      const MINOR = 0.02;
      const AVG = 0.03;
      const MAJOR = 0.05;
      when(this.actualAverageDmgIncrease).isGreaterThan(MINOR)
        .addSuggestion((suggest, actual, recommended) => {
        return suggest(`You gained an average increase on Aimed Shot/Piercing Shot damage `)
          .icon('ability_hunter_snipertraining')
          .actual(`${this.actualAverageDmgIncrease}`)
          .recommended(`It is recommended to be gaining ${formatPercentage(recommended)}% damage`)
          .regular(AVG)
          .major(MAJOR);
      });
  }
  statistic() {
    //calculates the FLAT increase in dmg on average
    const averagePatientSniperDmgIncreaseWithTS = (this.patientSniperTracker.piercingShotDmgIncreaseWithTS + this.patientSniperTracker.piercingShotDmgIncreaseNoTS + this.patientSniperTracker.aimedShotDmgIncreaseWithTS + this.patientSniperTracker.aimedShotDmgIncreaseNoTS) / (this.patientSniperTracker.aimedShotsNoTS + this.patientSniperTracker.aimedShotsWithTS + this.patientSniperTracker.piercingShotsNoTS + this.patientSniperTracker.piercingShotsWithTS);
    const averagePSDmgIncreaseAimedOnly = (this.patientSniperTracker.aimedShotDmgIncreaseNoTS + this.patientSniperTracker.aimedShotDmgIncreaseWithTS) / (this.patientSniperTracker.aimedShotsWithTS + this.patientSniperTracker.aimedShotsNoTS);
    const averagePSDmgIncreasePiercingOnly = (this.patientSniperTracker.piercingShotDmgIncreaseNoTS + this.patientSniperTracker.piercingShotDmgIncreaseWithTS) / (this.patientSniperTracker.piercingShotsNoTS + this.patientSniperTracker.piercingShotsWithTS);
    //calculates the actual dmg increase compared to not having Patient Sniper with this formula:
    // ((1+(UARanks*0.03)+0.3+0.06*PatientSniper"Ranks")/(1+0.3+(UARanks*0.03)))-1
    const actualAverageDmgIncrease = ((1 + ((this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing) / 2) + averagePatientSniperDmgIncreaseWithTS) / (1 + ((this.patientSniperTracker.patientSniper[SPELLS.AIMED_SHOT.id].vulnerableModifierAimed + this.patientSniperTracker.patientSniper[SPELLS.PIERCING_SHOT_TALENT.id].vulnerableModifierPiercing ) / 2))) - 1;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`+${formatPercentage(actualAverageDmgIncrease)}%`}
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
