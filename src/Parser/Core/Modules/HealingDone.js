import React from 'react';

import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import Module from 'Parser/Core/Module';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import HealingValue from './HealingValue';

class HealingDone extends Module {
  _total = new HealingValue(); // consider this "protected", so don't change this from other modules. If you want special behavior you must add that code to an extended version of this module.
  get total() {
    return this._total;
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
      this._addHealing(event, 0, event.amount, 0);
    }
  }
  on_removebuff(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      if (event.absorb) {
        this._addHealing(event, 0, 0, event.absorb);
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
  _subtractHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealing(event, -amount, -absorbed, -overheal);
  }

  showStatistic = false;
  statistic() {
    return this.showStatistic && (
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
        tooltip={`The total healing done recorded was ${formatThousands(this.total.effective)}.`}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-health-bg"
              style={{ width: `${this.total.regular / this.total.raw * 100}%` }}
              data-tip={`Regular healing done, not including absorbs.`}
            >
              <img src="/img/healing.png" alt="Healing" />
            </div>
            <div
              className="Druid-bg"
              style={{ width: `${this.total.absorbed / this.total.raw * 100}%` }}
              data-tip="Absorbed healing. This currently includes both healing by absorbs as well as healing that gets absorbed by debuffs."
            >
              <img src="/img/absorbed.png" alt="Absorb Healing" />
            </div>
            <div
              className="remainder DeathKnight-bg"
              data-tip={`You did a total of ${formatPercentage(this.total.overheal / this.total.raw)} % overhealing (${formatThousands(this.total.overheal)}). Overhealing can be caused by playing poorly such as selecting the wrong targets or casting abilities at the wrong time, other healers sniping, and/or bringing too many healers.`}
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
