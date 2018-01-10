import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPECS from 'common/SPECS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import FocusTracker from './FocusChart/FocusTracker';

class TimeFocusCapped extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
    combatants: Combatants,
  };

  get getTotalWaste() {
    let waste = this.focusTracker.secondsCapped * this.focusTracker.focusGen;
    if (this.focusTracker.generatorCasts) {
      waste += Object.values(this.focusTracker.activeFocusWasted).reduce((sum, waste) => sum + waste, 0);
    }
    return Math.round(waste);
  }

  statistic() {
    const totalFocusWaste = this.getTotalWaste;
    const percentCapped = formatPercentage(this.focusTracker.secondsCapped / (this.owner.fightDuration / 1000));
    return (
      <StatisticBox
        icon={<Icon icon="ability_hunter_focusfire" alt="Focus Wasted" />}
        label="Time Focus Capped"
        tooltip={`You wasted <b> ${totalFocusWaste}  </b> focus. <br />
        That's <b>  ${formatPercentage(totalFocusWaste / (this.owner.fightDuration / 1000 * this.focusTracker.focusGen))}% </b> of your total focus generated.
        <br /> For more details, see the Focus Chart tab.`}
        value={`${percentCapped} %`}
        //Time not Focus-Capped: {Math.round((this.owner.fightDuration / 1000 - this.focusTracker.secondsCapped) * 100) / 100}s / {Math.floor(this.owner.fightDuration / 1000)}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-health-bg"
              style={{ width: `${(100 - percentCapped)}%` }}
              data-tip={`You spent <b>${100 - percentCapped}%</b> of your time, or <b>${Math.round(Math.floor(this.owner.fightDuration / 1000) - this.focusTracker.secondsCapped)}s</b> under the focus cap.`}
            >
            </div>
            <div
              className="DeathKnight-bg"
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
  get suggestionThresholds() {
    return {
      actual: this.focusTracker.secondsCapped / (this.owner.fightDuration / 1000),
      isGreaterThan: {
        minor: 0.025,
        average: 0.035,
        major: 0.045,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    if (this.combatants.selected.spec === SPECS.MARKSMANSHIP_HUNTER) {
      when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You're spending a lot of time being focus capped. Try and avoid this as it is a significant DPS loss. It's better to shoot a non-vulnerable <SpellLink id={SPELLS.AIMED_SHOT.id} />, than spend time at max focus. You wasted a total of {this.getTotalWaste} focus over the course of the fight.</Wrapper>)
            .icon('ability_hunter_focusfire')
            .actual(`${actual}%`)
            .recommended(`<${recommended}% is recommended`);
        });
    } else if (this.combatants.selected.spec === SPECS.BEAST_MASTERY_HUNTER) {
      when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You're spending a lot of time being focus capped. Try and avoid this as it is a significant DPS loss. Remember to cast <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap, if no other focus spender is ready to use. You wasted a total of {this.getTotalWaste} focus over the course of the fight.</Wrapper>)
            .icon('ability_hunter_focusfire')
            .actual(`${actual}%`)
            .recommended(`<${recommended}% is recommended`);
        });
    }
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default TimeFocusCapped;
