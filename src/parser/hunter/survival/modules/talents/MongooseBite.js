import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const MAX_STACKS = 5;

const MAX_TRAVEL_TIME = 700;

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
  aspectOfTheEagleFixed = false;
  buffApplicationTimestamp = null;

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
      // Because Aspect of the Eagle applies a traveltime to Mongoose Bite, it sometimes applies the buff before it hits, despite not increasing the damage.
      // This fixes that, ensuring we reduce by 1, and later increasing it by one.

      if (this.lastMongooseBiteStack === 1 && event.timestamp < this.buffApplicationTimestamp + MAX_TRAVEL_TIME) {
        this.lastMongooseBiteStack -= 1;
        this.aspectOfTheEagleFixed = true;
      }
      if (this.lastMongooseBiteStack === 1) {
        console.log("Her er der 1 stack", event.timestamp);
      }
      if (!this.mongooseBiteStacks[this.lastMongooseBiteStack]) {
        this.mongooseBiteStacks[this.lastMongooseBiteStack].push(this.lastMongooseBiteStack);
      } else {
        this.mongooseBiteStacks[this.lastMongooseBiteStack]++;
      }
      if (this.aspectOfTheEagleFixed) {
        this.lastMongooseBiteStack += 1;
        this.aspectOfTheEagleFixed = false;
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
    const flattenArray = this.mongooseBiteStacks.reduce((acc, val) => acc.concat(val), []);
    return flattenArray.reduce((totalHits, stackHits) => totalHits + stackHits, 0);
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
    this.buffApplicationTimestamp = event.timestamp;
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
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.MONGOOSE_FURY.id} />}
        value={`${this.fiveStackMongooseBites}/${this.totalMongooseBites}`}
        label="5 stack bites"
        tooltip={`This may look like it's bugged, but this is actually how Mongoose Bite functions live in-game. There is no such thing as a 1-stack Mongoose Bite.
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
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default MongooseBite;
