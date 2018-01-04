import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import Atonement from '../Spells/Atonement';

const DEBUG = false;

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
  lastBuffTimestamp = 0;
  lastHasteValue = 0;

  avgHaste = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.ESTEL_DEJAHNAS_INSPIRATION.id);
  }

  get timePerHastePercentage() {
    return Object.keys(this._timePerHastePercentage).map(key => this._timePerHastePercentage[key]);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) {
      console.log(`num atonements found: ${this.atonementModule.numAtonementsActive}`);
      this.lastHasteValue = this.atonementModule.numAtonementsActive;
      this.lastBuffTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) {
      const oldTime = this._timePerHastePercentage[this.lastHasteValue];
      this._timePerHastePercentage[this.lastHasteValue] = oldTime + (event.timestamp - this.lastBuffTimestamp);
      this.lastHasteValue = 0;
      this.lastBuffTimestamp = event.timestamp;
    }
  }

  on_finished() {
    let time = 0;

    for (let i = 0; i < this._timePerHastePercentage.length; i++) {
      time += this._timePerHastePercentage[i];
      this.avgHaste += this._timePerHastePercentage[i] * i;
    }

    this.avgHaste = this.avgHaste / this.owner.fightDuration;

    // verifing that the total buff time matches the getBuffUptime implementation.
    if (DEBUG) {
      console.log(`Total Buff Time: ${time}`);
      console.log(`Total Buff Uptime: ${time / this.owner.fightDuration}`);
      console.log(`Average Haste: ${this.avgHaste}`);
    }
  }

  item() {
    const uptimePercent = (this.combatants.selected.getBuffUptime(SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id) / this.owner.fightDuration) || 0;
    const avgHaste = (this.avgHaste / 100) || 0;

    return {
      item: ITEMS.ESTEL_DEJAHNAS_INSPIRATION,
      result: (
        <Wrapper>
          {formatPercentage(avgHaste)} % average haste / {formatPercentage(uptimePercent)} % uptime
        </Wrapper>
      ),
    };
  }
}

export default Estel;
