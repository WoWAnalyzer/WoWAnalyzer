import React from 'react';
import Module from 'Parser/Core/Module';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';

import FocusTracker from '../FocusChart/FocusTracker';

class TimeFocusCapped extends Module {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  get getTotalWaste(){
    let waste = this.focusTracker.secondsCapped * this.focusTracker.focusGen;
    if (this.focusTracker.generatorCasts) {
      waste += Object.values(this.focusTracker.activeFocusWasted).reduce((sum, waste) => sum + waste, 0);
    }
    return Math.round(waste);
  }

  statistic() {
    const totalFocusWaste = this.getTotalWaste;
    const percentCapped = Math.round(this.focusTracker.secondsCapped/(this.owner.fightDuration/1000) * 10000)/100;
    return (
      <StatisticBox
        icon = {<Icon icon='ability_hunter_focusfire' alt = 'Focus Wasted' />}
        label = 'Time Focus Capped'
        tooltip= {`You wasted <b> ${totalFocusWaste}  </b> focus. <br /> 
        That's <b>  ${formatPercentage(totalFocusWaste/(this.owner.fightDuration/1000 * this.focusTracker.focusGen) * 10000)/100}% </b> of your total focus generated. 
        <br /> For more details, see the Focus Chart tab.`}
        value =  {`${percentCapped} %`}
      //Time not Focus-Capped: {Math.round((this.owner.fightDuration / 1000 - this.focusTracker.secondsCapped) * 100) / 100}s / {Math.floor(this.owner.fightDuration / 1000)}
      footer={(
        <div className="statistic-bar">
        <div
          className="stat-health-bg"
          style={{ width: `${(100-percentCapped)}%` }}
          data-tip={`You spent <b>${100-percentCapped}%</b> of your time, or <b>${Math.round(Math.floor(this.owner.fightDuration/1000) - this.focusTracker.secondsCapped)}s</b> under the focus cap.`}
        >
        </div>
          <div
            className="stat-overhealing-bg"
            style={{ width: `${percentCapped}%` }}
            data-tip={`You spent <b>${percentCapped}%</b>, or <b>${Math.round(this.focusTracker.secondsCapped)}s</b> of your time focus capped.`}
          >
          </div>
        </div>
      )}
      footerStyle={{ overflow: 'hidden' }}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default TimeFocusCapped;
