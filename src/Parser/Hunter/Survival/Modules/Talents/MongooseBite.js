import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const MAX_STACKS = 5;

/**
 * Mongoose Fury increases Mongoose Bite damage by 15% for 14 sec, stacking up to 5 times. Successive
 * attacks do not increase duration.
 *
 * Example log: https://www.warcraftlogs.com/reports/CDL6mZfWdcgQX9wT#fight=2&type=damage-done&source=23
 */

class MongooseBite extends Analyzer {

  damage = 0;
  mongooseBiteStacks = [];
  lastMongooseBiteStack = 0;
  totalWindowsStarted = 0;
  fiveBiteWindows = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id);
    this.mongooseBiteStacks = Array.from({ length: MAX_STACKS + 1 }, x => []);
  }

  handleStacks(event) {
    if (event.type === 'removebuff' || (isNaN(event.stack) && event.type !== 'damage')) { //NaN check if player is dead during on_finish
      this.lastMongooseBiteStack = 0;
    }
    if (event.type === 'damage') {
      if (!this.mongooseBiteStacks[this.lastMongooseBiteStack]) {
        this.mongooseBiteStacks[this.lastMongooseBiteStack].push(this.lastMongooseBiteStack);
      } else {
        this.mongooseBiteStacks[this.lastMongooseBiteStack]++;
      }
      this.damage += event.amount + (event.absorbed || 0);
    }
    if (event.type === 'applybuff') {
      this.lastMongooseBiteStack = 1;
      this.totalWindowsStarted += 1;
    }
    if (event.type === 'applybuffstack') {
      this.lastMongooseBiteStack = event.stack;
      if (this.lastMongooseBiteStack === MAX_STACKS) {
        this.fiveBiteWindows += 1;
      }
    }
  }

  get mongooseBiteByStacks() {
    return this.mongooseBiteStacks;
  }

  get totalMongooseBites() {
    return this.mongooseBiteStacks.flatten().reduce((totalHits, stackHits) => totalHits + stackHits, 0);
  }

  get fiveStackMongooseBites() {
    return this.mongooseBiteStacks[MAX_STACKS];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_BITE_TALENT.id && spellId !== SPELLS.MONGOOSE_BITE_TALENT_AOTE.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this.handleStacks(event);
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.MONGOOSE_FURY.id} />}
        value={`${this.fiveStackMongooseBites}/${this.totalMongooseBites}`}
        label="5 stack bites"
        tooltip={`
        <ul>
          <li>You hit an average of ${(this.mongooseBiteStacks[MAX_STACKS] / this.fiveBiteWindows).toFixed(1)} bites when you had ${MAX_STACKS} stacks of Mongoose Fury. </li>
          <li>You hit an average of ${(this.totalMongooseBites / this.totalWindowsStarted).toFixed(1)} bites per Mongoose Fury window started.</li>
        </ul>`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Hits (total)</th>
              <th>Hits (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.mongooseBiteByStacks).map((e, i) => (
              <tr key={i}>
                <th>{i}</th>
                <td>{e}</td>
                <td>{formatPercentage(e / this.totalMongooseBites)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default MongooseBite;
