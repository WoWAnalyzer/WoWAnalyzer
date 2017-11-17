import React from 'react';

import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import HealingValue from './HealingValue';

class HealingDone extends Analyzer {
  _total = new HealingValue();
  get total() {
    return this._total;
  }
  _healingByAbsorbs = new HealingValue();
  get healingByAbsorbs() {
    return this._healingByAbsorbs;
  }

  bySecond = {};

  _byAbility = {};
  byAbility(spellId) {
    if (!this._byAbility[spellId]) {
      return new HealingValue();
    }
    return this._byAbility[spellId];
  }

  on_heal(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealing(event, event.amount, event.absorbed, event.overheal);
    }
  }
  on_absorbed(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealingByAbsorb(event, event.amount, 0, 0);
    }
  }
  on_removebuff(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      if (event.absorb) {
        this._addHealingByAbsorb(event, 0, 0, event.absorb);
      }
    }
  }

  _addHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    this._total = this._total.add(amount, absorbed, overheal);

    const spellId = event.ability.guid;
    if (this._byAbility[spellId]) {
      this._byAbility[spellId] = this._byAbility[spellId].add(amount, absorbed, overheal);
    } else {
      this._byAbility[spellId] = new HealingValue(amount, absorbed, overheal);
    }

    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new HealingValue()).add(amount, absorbed, overheal);
  }
  _addHealingByAbsorb(event, amount = 0, absorbed = 0, overhealing = 0) {
    this._addHealing(event, amount, absorbed, overhealing);
    this._healingByAbsorbs = this._healingByAbsorbs.add(amount, absorbed, overhealing);
  }
  _subtractHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealing(event, -amount, -absorbed, -overheal);
  }
  _subtractHealingByAbsorb(event, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealingByAbsorb(event, -amount, -absorbed, -overheal);
  }

  showStatistic = false;
  statistic() {
    if (!this.showStatistic) return null;

    const healingWithoutAbsorbs = this.total.regular - this.healingByAbsorbs.regular;

    return (
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />
        )}
        value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} HPS`}
        label="Healing done"
        tooltip={`Total healing done: <b>${formatThousands(this.total.effective)}</b>`}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-healing-bg"
              style={{ width: `${healingWithoutAbsorbs / this.total.raw * 100}%` }}
              data-tip={`Regular healing done, not including absorbs. You did a total of ${formatNumber(healingWithoutAbsorbs)} regular healing (${formatPercentage(healingWithoutAbsorbs / this.total.raw)}% of raw healing).`}
            >
              <img src="/img/healing.png" alt="Healing" />
            </div>
            {this.healingByAbsorbs.regular > 0 && (
              <div
                className="stat-healing-absorbs-bg"
                style={{ width: `${this.healingByAbsorbs.regular / this.total.raw * 100}%` }}
                data-tip={`Healing by absorbs. This only includes damage prevented by absorbs. You did a total of ${formatNumber(this.healingByAbsorbs.regular)} healing with absorbs (${formatPercentage(this.healingByAbsorbs.regular / this.total.raw)}% of raw healing).`}
              >
                <img src="/img/absorbed.png" alt="Absorb Healing" />
              </div>
            )}
            {this.total.absorbed > 0 && (
              <div
                className="stat-negative-absorbs-bg"
                style={{ width: `${this.total.absorbed / this.total.raw * 100}%` }}
                data-tip={`Absorbed healing. This only includes healing that gets absorbed by debuffs. You had a total of ${formatNumber(this.total.absorbed)} healing absorbed (${formatPercentage(this.total.absorbed / this.total.raw)}% of raw healing).`}
              >
                <img src="/img/negative-absorbed.png" alt="Absorbed Healing" />
              </div>
            )}
            <div
              className="remainder stat-overhealing-bg"
              data-tip={`Overhealing. You did a total of ${formatNumber(this.total.overheal)} overhealing (${formatPercentage(this.total.overheal / this.total.raw)} % of raw healing). Overhealing can be caused by playing poorly such as selecting the wrong targets or casting abilities at the wrong time, other healers sniping, and/or bringing too many healers.`}
            >
              <img src="/img/overhealing.png" alt="Overhealing" />
            </div>
          </div>
        )}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default HealingDone;
