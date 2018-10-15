import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPECS from 'game/SPECS';

import Analyzer from 'parser/core/Analyzer';

import FocusTracker from './focuschart/FocusTracker';

/**
 * Tracks the amount of time spent at focus cap.
 *
 * Example log: https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */

class TimeFocusCapped extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  hasSA = false;

  constructor(...args) {
    super(...args);
    // This Azerite Trait makes it so you want to spam your focus generator even whilst focus capped for procs,
    // this leads to gameplay where you're spending 50% of the time focuscapped, making this module irrelevant
    this.hasSA = this.selectedCombatant.hasTrait(SPELLS.STEADY_AIM.id);
    if (this.hasSA && this.selectedCombatant.spec === SPECS.MARKSMANSHIP_HUNTER) {
      this.active = false;
    }
  }

  get getTotalWaste() {
    let waste = this.focusTracker.secondsCapped * this.focusTracker.focusGen;
    if (this.focusTracker.generatorCasts) {
      waste += Object.values(this.focusTracker.activeFocusWasted).reduce((sum, waste) => sum + waste, 0);
    }
    return Math.round(waste);
  }

  get totalGenerated() {
    const passiveGenerated = (this.owner.fightDuration / 1000 * this.focusTracker.averageFocusGen);
    let activeGenerated = 0;
    if (this.focusTracker.generatorCasts) {
      activeGenerated += Object.values(this.focusTracker.activeFocusGenerated).reduce((sum, generated) => sum + generated, 0);
    }
    return Math.round(passiveGenerated + activeGenerated);
  }

  statistic() {
    const percentCapped = formatPercentage(this.focusTracker.secondsCapped / (this.owner.fightDuration / 1000));
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(11)}
        icon={<Icon icon="ability_hunter_focusfire" alt="Focus Wasted" />}
        label="Time Focus Capped"
        tooltip={`You wasted <b> ${this.getTotalWaste}  </b> focus. <br />
        That's <b>  ${formatPercentage(this.getTotalWaste / this.totalGenerated)}% </b> of your total focus generated.
        <br /> For more details, see the Focus Chart tab.`}
        value={`${percentCapped}%`}
        //Time not Focus-Capped: {Math.round((this.owner.fightDuration / 1000 - this.focusTracker.secondsCapped) * 100) / 100}s / {Math.floor(this.owner.fightDuration / 1000)}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-health-bg"
              style={{ width: `${(100 - percentCapped)}%` }}
              data-tip={`You spent <b>${100 - percentCapped}%</b> of your time, or <b>${Math.round(Math.floor(this.owner.fightDuration / 1000) - this.focusTracker.secondsCapped)}s</b> under the focus cap.`}
            />
            <div
              className="DeathKnight-bg"
              style={{ width: `${percentCapped}%` }}
              data-tip={`You spent <b>${percentCapped}%</b>, or <b>${Math.round(this.focusTracker.secondsCapped)}s</b> of your time focus capped.`}
            />
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
        minor: 0.075,
        average: 0.125,
        major: 0.175,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    if (this.selectedCombatant.spec === SPECS.MARKSMANSHIP_HUNTER) {
      when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You're spending a lot of time being focus capped. Try and avoid this as it is a significant DPS loss. You wasted a total of {this.getTotalWaste} focus over the course of the fight.</>)
            .icon('ability_hunter_focusfire')
            .actual(`${formatPercentage(actual)}%`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`);
        });
    } else if (this.selectedCombatant.spec === SPECS.BEAST_MASTERY_HUNTER) {
      when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You're spending a lot of time being focus capped. Try and avoid this as it is a significant DPS loss. Remember to cast <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap, if no other focus spender is ready to use. You wasted a total of {this.getTotalWaste} focus over the course of the fight.</>)
            .icon('ability_hunter_focusfire')
            .actual(`${formatPercentage(actual)}%`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`);
        });
    } else if (this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER) {
      when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You're spending a lot of time being focus capped. Try and avoid this as it is a significant DPS loss. Remember to cast focus spenders such as <SpellLink id={SPELLS.RAPTOR_STRIKE.id} /> to stay off the focus cap. You wasted a total of {this.getTotalWaste} focus over the course of the fight.</>)
            .icon('ability_hunter_focusfire')
            .actual(`${formatPercentage(actual)}%`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`);
        });
    }
  }
}

export default TimeFocusCapped;
