import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import Atonement from '../Spells/Atonement';

const DEBUG = true;

class Estel extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonementModule: Atonement,
  };

  // max number of buffs = 30 (30 player raid)... techincally it's higher
  // with pets, but getting that many atonments out is nigh impossible.
  // ideally I think I would use a dictionary... but this works for now while I get it working
  _timePerHastePercentage = [0, 0, 0, 0, 0,
                             0, 0, 0, 0, 0,
                             0, 0, 0, 0, 0,
                             0, 0, 0, 0, 0,
                             0, 0, 0, 0, 0,
                             0, 0, 0, 0, 0];
  lastBuffTimestampA = 0;
  lastBuffTimestampB = 0;
  lastHasteValueA = 0;
  lastHasteValueB = 0;
  A_lock = false;
  B_lock = false;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.ESTEL_DEJAHNAS_INSPIRATION.id);
  }

  get timePerHastePercentage() {
    return Object.keys(this._timePerHastePercentage).map(key => this._timePerHastePercentage[key]);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) {
      if (!this.A_lock) {
        this.A_lock = true;
        this.lastHasteValueA = this.atonementModule.numAtonementsActive;
        this.lastBuffTimestampA = event.timestamp;
      } else if (!this.B_lock){
        this.B_lock = true;
        this.lastHasteValueB = this.atonementModule.numAtonementsActive;
        this.lastBuffTimestampB = event.timestamp;
      } else {
        console.log(`ALEX_DEBUG_ERROR`);
      }
    }
  }

  // on_byPlayer_refreshbuff(event) {
  //   const spellId = event.ability.guid;

  //   if (spellId === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) {
  //     if (this.runA) {
  //       const oldTime = this._timePerHastePercentage[this.lastHasteValue];
  //       this._timePerHastePercentage[this.lastHasteValueA] = oldTime + (event.timestamp - this.lastBuffTimestampA);
  //       this.lastHasteValueA = this.atonementModule.numAtonementsActive;
  //       this.lastBuffTimestampA = event.timestamp;
  //       this.runA = false;
  //     } else {
  //       const oldTime = this._timePerHastePercentage[this.lastHasteValue];
  //       this._timePerHastePercentage[this.lastHasteValueB] = oldTime + (event.timestamp - this.lastBuffTimestampB);
  //       this.lastHasteValueB = this.atonementModule.numAtonementsActive;
  //       this.lastBuffTimestampB = event.timestamp;
  //       this.runA = true;
  //     }

  //   }
  // }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) {
      if (this.A_lock) {
        const oldTime = this._timePerHastePercentage[this.lastHasteValueA];
        this._timePerHastePercentage[this.lastHasteValueA] = oldTime + (event.timestamp - this.lastBuffTimestampA);
        console.log(`ALEX_DEBUG_HASTE_A:${this.lastHasteValueA}`);
        console.log(`ALEX_DEBUG_TIME_A:${event.timestamp}, ${this.lastBuffTimestampA}, ${this._timePerHastePercentage[this.lastHasteValueA]}`);
        this.lastHasteValueA = 0;
        this.lastBuffTimestampA = event.timestamp;
        this.A_lock= false;
      } else if (this.B_lock) {
        const oldTime = this._timePerHastePercentage[this.lastHasteValueB];
        this._timePerHastePercentage[this.lastHasteValueB] = oldTime + (event.timestamp - this.lastBuffTimestampB);
        console.log(`ALEX_DEBUG_HASTE_B:${this.lastHasteValueB}`);
        console.log(`ALEX_DEBUG_TIME_B:${event.timestamp}, ${this.lastBuffTimestampB}, ${this._timePerHastePercentage[this.lastHasteValueB]}`);
        this.lastHasteValueB = 0;
        this.lastBuffTimestampB = event.timestamp;
        this.B_lock = false;
      } else {
        console.log(`ALEX_DEBUG_LOCK_REMOVAL_ERROR`);
      }

    }
  }

  on_finished() {
    if(DEBUG) {
      console.log(this._timePerHastePercentage);
      var avgHaste = 0;
      var time = 0;
      console.log(this._timePerHastePercentage.length);
      for (var i = 0; i < this._timePerHastePercentage.length; i++) { 
        time += this._timePerHastePercentage[i];
        avgHaste += this._timePerHastePercentage[i] * i;
      }
      console.log(`Total Buff Time: ${time}`);
      console.log(`Total Buff Uptime: ${time/this.owner.fightDuration}`);
      avgHaste = avgHaste / this.owner.fightDuration;
      console.log(`Average Haste: ${avgHaste}`);
    }
  }

  item() {
    const uptimePercent = (this.combatants.selected.getBuffUptime(SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) / this.owner.fightDuration) || 0;
    const avgHaste = this.avgHaste || 0;

    return {
      item: ITEMS.ESTEL_DEJAHNAS_INSPIRATION,
      result: (
        <span>
          <dfn>
            {formatPercentage(avgHaste)} % average haste / {formatPercentage(uptimePercent)} % uptime
          </dfn>
        </span>
      ),
    };
  }
}

export default Estel;
