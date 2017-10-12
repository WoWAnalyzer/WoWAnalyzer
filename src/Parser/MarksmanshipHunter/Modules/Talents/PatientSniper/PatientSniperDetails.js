import React from 'react';

import Module from 'Parser/Core/Module';
import Tab from 'Main/Tab';
import PropTypes from 'prop-types';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';

import PatientSniperBreakdown from './PatientSniperBreakdown';
import PatientSniperTracker from './PatientSniperTracker';

class PatientSniperDetails extends Module {
  static dependencies = {
    patientSniperTracker: PatientSniperTracker,
  };

  suggestions(when) {
    const MINOR = 0;
    const AVG = 0;
    const MAJOR = 0;
  }
  statistic() {
    const totalAimedShotIncrease = (this.nonVulnerableAimedShots * 0) + (this.oneSecondIntoVulnerableAimed * 0.06) + (this.twoSecondsIntoVulnerableAimed * 0.12) + (this.threeSecondsIntoVulnerableAimed * 0.18) + (this.fourSecondsIntoVulnerableAimed * 0.24) + (this.fiveSecondsIntoVulnerableAimed * 0.30) + (this.sixSecondsIntoVulnerableAimed * 0.36);
    const totalAimedShots = this.nonVulnerableAimedShots + this.oneSecondIntoVulnerableAimed + this.twoSecondsIntoVulnerableAimed + this.threeSecondsIntoVulnerableAimed + this.fourSecondsIntoVulnerableAimed + this.fiveSecondsIntoVulnerableAimed + this.sixSecondsIntoVulnerableAimed;
    const averageAimedShotDamageIncrease = totalAimedShotIncrease / totalAimedShots;
    const goodAimedShots = this.fourSecondsIntoVulnerableAimed + this.fiveSecondsIntoVulnerableAimed + this.sixSecondsIntoVulnerableAimed;
    const goodAimedShotsPrVuln = goodAimedShots / this.totalVulnWindows;
    return (
      // TODO: Do avg gain - and then more information in the tab?
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PATIENT_SNIPER_TALENT.id} />}
        value={`${Math.round(goodAimedShotsPrVuln * 100) / 100}`}
        label="Avg Aimed Shots in last 3s"
        tooltip={`This tooltip showcases how many Aimed Shots you fired after x seconds of Vulnerable being on the target, aswell as the average damage increase you had from Patient Sniper: <br />
 Average gain pr. Aimed Shot: ${formatPercentage(averageAimedShotDamageIncrease)}%<br/>
 Non-vulnerable Aimed Shots: ${this.nonVulnerableAimedShots} <br />
0 seconds: ${this.zeroSecondsIntoVulnerableAimed} Aimed Shots <br/>
1 second: ${this.oneSecondIntoVulnerableAimed} Aimed Shots<br/>
2 seconds: ${this.twoSecondsIntoVulnerableAimed} Aimed Shots<br/>
3 seconds: ${this.threeSecondsIntoVulnerableAimed} Aimed Shots<br/>
4 seconds: ${this.fourSecondsIntoVulnerableAimed} Aimed Shots<br/>
5 seconds: ${this.fiveSecondsIntoVulnerableAimed} Aimed Shots<br/>
6 seconds: ${this.sixSecondsIntoVulnerableAimed} Aimed Shots<br/>
`} />
    );
  }

  tab() {
    return {
      title: 'Patient Sniepr Usage',
      url: 'patient-sniper',
      render: () => (
        <Tab title="Patient Sniper Usage Breakdown">
          <PatientSniperBreakdown
          nonVulnerableAimedShots = {this.patientSniperTracker.nonVulnerableA}
          />
        </Tab>
      ),
    };

  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}
export default PatientSniperDetails;
