import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class Souldrinker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  avgSoulDrinker = 0;
  _soulDrinker = [];
  _dsOverheals = [];

  SOULDRINKER_DURATION = 15;
  SOULDRINKER_EFFECTIVENESS = .5;
  SOULDRINKER_CAP = 30;

  /*
    _dsOverheals contains all healing events (DS & Consumption can trigger Souldrinker)
    _soulDrinker contains for each second the %-buff
  */

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.SOULDRINKER_TRAIT.id];
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DEATH_STRIKE_HEAL.id && event.ability.guid !== SPELLS.CONSUMPTION_HEAL.id) {
      return;
    }

    if (event.overheal === undefined) {
      return;
    }

    this._dsOverheals.push(event);
    this._soulDrinker = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => 0);

    //only add DS heals that did overheal
    const temp = this._dsOverheals.map(({ timestamp, maxHitPoints, overheal }) => {
      return {
        second: Math.floor((timestamp - this.owner.fight.start_time) / 1000) - 1,
        overhealPercent: (overheal * this.SOULDRINKER_EFFECTIVENESS / maxHitPoints) * 100,
      };
    });

    temp.forEach(({ second, overhealPercent }) => {
      const updateFrame = this._soulDrinker.slice(second, second + this.SOULDRINKER_DURATION);
      updateFrame.forEach((elem, index) => {
        let newPercent = updateFrame[index] += overhealPercent;
        if (newPercent > this.SOULDRINKER_CAP) {
          newPercent = this.SOULDRINKER_CAP;
        }
        updateFrame[index] = newPercent;
      });

      this._soulDrinker.splice(second, this.SOULDRINKER_DURATION, ...updateFrame);
    });

    const sum = this._soulDrinker.reduce((a, b) => {
      return a + b;
    });

    this.avgSoulDrinker = sum / this._soulDrinker.length;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOULDRINKER_TRAIT.id} />}
        value={`${ this.avgSoulDrinker.toFixed(2) }%`}
        label="average Soul Drinker buff"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Souldrinker;
