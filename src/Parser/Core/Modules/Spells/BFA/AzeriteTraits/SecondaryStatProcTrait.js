import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';

const CRIT = 'crit';
const VERSA = 'versa';
const MASTERY = 'mastery';
const HASTE = 'haste';

const STATS = {
  [CRIT]: {
    name: 'Crit',
    percentageFn: 'critPercentage',
  },
  [VERSA]: {
    name: 'Versatility',
    percentageFn: 'versatilityPercentage',
  },
  [MASTERY]: {
    name: 'Mastery',
    percentageFn: 'masteryPercentage',
  },
  [HASTE]: {
    name: 'Haste',
    percentageFn: 'hastePercentage',
  },
};

class SecondaryStatProcTrait extends Analyzer {
  static CRIT = CRIT;
  static VERSA = VERSA;
  static MASTERY = MASTERY;
  static HASTE = HASTE;

  static dependencies = {
    statTracker: StatTracker,
  };

  // info about trait passed in by subclass
  traitId;
  traitName;
  traitIcon;
  buffId;
  stats;

  // store trait ranks from combatant
  traitRanks;

  constructor(traitId, traitName, traitIcon, buffId, stats, ...args) {
    super(...args);

    this.traitId = traitId;
    this.traitName = traitName;
    this.traitIcon = traitIcon;
    this.buffId = buffId;
    this.stats = stats;

    this.active = this.selectedCombatant.hasTrait(this.traitId);
    if (!this.active) {
      return;
    }

    this.traitRanks = this.selectedCombatant.traitRanks(this.traitId);

    // sanity check to double check the subclass is implemented correctly matching the data we have about the trait
    if (this.stats.length !== this.statBuffs.length) {
      throw new Error("Mismatch between stat buffs specified in azerite trait effects and passed in from subclass");
    }
  }

  get statBuffs() {
    return Object.values(this.traitRanks).reduce((stats, rank) => {
      calculateAzeriteEffects(this.traitId, rank).forEach((statBuff, idx) => {
        stats[idx] += statBuff;
      });

      return stats;
    }, calculateAzeriteEffects(this.traitId, 0).map(() => 0));
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(this.buffId) / this.owner.fightDuration;
  }

  /**
   * to make the tooltip reflect multiple ranks of the trait we use a bit of a hacky way to figure out which ilvl would result in displaying the sum of the bonus damage
   */
  determineIlvlForSum() {
    let ilvl = 0;
    if (this.traitRanks.length === 1) {
      ilvl = this.traitRanks[0];
    } else {
      const desiredBonus = this.traitRanks.map((rank) => calculateAzeriteEffects(this.traitId, rank)[0]).reduce((total, bonus) => total + bonus, 0);
      let ilvlDmgBonus = calculateAzeriteEffects(this.traitId, this.traitRanks[0])[0];
      for (ilvl = this.traitRanks[0]; ilvlDmgBonus < desiredBonus; ilvl++) {
        ilvlDmgBonus = calculateAzeriteEffects(this.traitId, ilvl)[0];
      }
    }

    return ilvl;
  }

  statistic() {
    const statBuffs = this.statBuffs;

    const statStrings = this.stats.map((stat, idx) => {
      const statBuff = statBuffs[idx];
      const avgStat = this.uptime * statBuff;
      const statInfo = STATS[stat];
      const percentageFn = statInfo.percentageFn;
      const avgPercentage = this.statTracker[percentageFn](avgStat);

      return [
        `${formatPercentage(avgPercentage)}% avg ${statInfo.name}`,
        `<b>${statBuff} ${statInfo.name} Rating</b>`,
        `<b>${formatNumber(avgStat)}</b> average Haste Rating (${formatPercentage(avgPercentage)}%)`,
      ];
    });

    const valueStrings = statStrings.map((strings) => strings[0]).join(' and ');
    const tooltip1Strings = statStrings.map((strings) => strings[1]).join(' and ');
    const tooltip2Strings = statStrings.map((strings) => strings[2]).join(' and ');

    const ilvl = this.determineIlvlForSum();

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={this.traitId}
        ilvl={ilvl}
        value={valueStrings}
        tooltip={`${this.traitName} grants ${tooltip1Strings} while active.<br />
It was active for <b>${formatPercentage(this.uptime)}%</b> of the fight, granting ${tooltip2Strings}.`}
      />
    );
  }
}

export default SecondaryStatProcTrait;
