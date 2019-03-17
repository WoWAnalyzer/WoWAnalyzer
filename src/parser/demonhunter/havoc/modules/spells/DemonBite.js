import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands, formatPercentage } from 'common/format';

/**
 * Example Report: https://www.warcraftlogs.com/reports/4GR2pwAYW8KtgFJn/#fight=6&source=18
 */
class DemonBite extends Analyzer{

  furyGain = 0;
  furyWaste = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEMONS_BITE), this.onEnergizeEvent);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMONS_BITE), this.onDamageEvent);
  }

  onEnergizeEvent(event) {
    this.furyGain += event.resourceChange;
    this.furyWaste += event.waste;
  }

  onDamageEvent(event) {
    this.damage += event.amount;
  }

  get furyPerMin() {
    return ((this.furyGain - this.furyWaste) / (this.owner.fightDuration/60000)).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.furyWaste / this.furyGain,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> Be mindful of your Fury levels and spend it before capping.</>)
          .icon(SPELLS.DEMONS_BITE.icon)
          .actual(`${formatPercentage(actual)}% Fury wasted`)
          .recommended(`${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic(){
    const effectiveFuryGain = this.furyGain - this.furyWaste;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEMONS_BITE.id} />}
        label="Demon Bite"
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={(
          <>
            <span style={{ fontSize: '75%' }}>
              {this.furyPerMin} Fury per min <br />
              {this.owner.formatItemDamageDone(this.damage)}
            </span>
          </>
        )}
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage<br />
            {effectiveFuryGain} Effective Fury gained<br />
            {this.furyGain} Total Fury gained<br />
            {this.furyWaste} Fury wasted
          </>
        )}
      />
    );
  }
}
export default DemonBite;
