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
  static
  dependencies = {
    patientSniperTracker: PatientSniperTracker,
    combatants: Combatants,
  };
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PATIENT_SNIPER_TALENT.id);
  }

  suggestions(when) {
    /*suggestions(when) {
      const MINOR = 0;
      const AVG = 0;
      const MAJOR = 0;
    }*/
  }
  statistic() {
    //calculates the FLAT increase in dmg on average
    const averagePatientSniperDmgIncreaseWithTS = (this.piercingShotDmgIncreaseWithTS + this.piercingShotDmgIncreaseNoTS + this.aimedShotDmgIncreaseWithTS + this.aimedShotDmgIncreaseNoTS) / (this.aimedShotsNoTS + this.aimedShotsWithTS + this.piercingShotsNoTS + this.piercingShotsWithTS);
    const averagePSDmgIncreaseAimedOnly = (this.aimedShotDmgIncreaseNoTS + this.aimedShotDmgIncreaseWithTS) / (this.aimedShotsWithTS + this.aimedShotsNoTS);
    const averagePSDmgIncreasePiercingOnly = (this.piercingShotDmgIncreaseNoTS + this.piercingShotDmgIncreaseWithTS) / (this.piercingShotsNoTS + this.piercingShotsWithTS);
    //calculates the actual dmg increase compared to not having Patient Sniper with this formula:
    // ((1+(UARanks*0.03)+0.3+0.06xPatientSniper"Ranks")/(1+0.3+(UARanks*0.03)))-1
    const actualDmgIncrease = ((1 + this.vulnerableModifer + averagePatientSniperDmgIncreaseWithTS) / (1 + this.vulnerableModifer)) - 1;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`+${formatPercentage(actualDmgIncrease)}%`}
        label="Avg % dmg change from PS"
        tooltip={` This shows how much your average Aimed Shot and Piercing Shot was increased by compared to how much it would have done without being affected by Patient Sniper. These include Aimed/Piercing Shots fired during Trueshot windows. <br /> Below you'll see them individually, and if you want to see more Patient Sniper information (such as without Trueshot windows), please check the "Patient Sniper Usage" tab in the menu. <br />
Aimed Shot increase: ${formatPercentage(((1 + this.vulnerableModifer + averagePSDmgIncreaseAimedOnly) / (1 + this.vulnerableModifer)) - 1)}% <br /> Piercing Shot increase: ${formatPercentage(((1 + this.vulnerableModifer + averagePSDmgIncreasePiercingOnly) / (1 + this.vulnerableModifer)) - 1)}% <br />`} />
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
}

export default PatientSniperDetails;
