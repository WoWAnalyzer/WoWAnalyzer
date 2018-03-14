import React from 'react';

import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DeathTracker from 'Parser/Core/Modules/DeathTracker';

const BASE_IMMORTALITY_ILVL = 850; // sub-850 items are unobtainable anymore, and I have no stats for them
const BASE_ARMOR_PER_CARD = {
  191624: 804, // Ace -- 970 @ 900
  191625: 1006, // 2 -- 1213
  191626: 1206, // 3 -- 1454
  191627: 1408, // 4 -- 1698
  191628: 1609, // 5 -- 1940
  191629: 1810, // 6 -- 2182
  191630: 2011, // 7 -- 2425
  191631: 2414, // 8 -- 2911
};

export const STAT_TRACKER_BUFFS = Object.entries(BASE_ARMOR_PER_CARD).reduce((result, [id, baseArmor]) => {
  result[id] = {
    itemId: ITEMS.DARKMOON_DECK_IMMORTALITY.id,
    armor: (_, item) => calculateSecondaryStatDefault(BASE_IMMORTALITY_ILVL, baseArmor, item.itemLevel),
  };
  return result;
}, {});

const NUM_CARDS = 8;
const MIN_CARD = 191624;
const MAX_CARD = 191631;

/**
 * Darkmoon Deck: Immortality -
 * Equip: Increases Armor by 925-2777. The amount of armor depends on
 * the top card of the deck.
 * Equip: Periodically shuffle the deck while in combat.
 */
class DarkmoonDeckImmortality extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    deathTracker: DeathTracker,
  };

  ARMOR_PER_CARD = {};
  currentArmor = 0;
  _totalArmor = 0;

  _lastBuffChange = 0;

  get minArmor() {
    return this.ARMOR_PER_CARD[MIN_CARD];
  }

  get maxArmor() {
    return this.ARMOR_PER_CARD[MAX_CARD];
  }

  get expAverageArmor() {
    return Object.values(this.ARMOR_PER_CARD).reduce((sum, cur) => sum + cur, 0) / NUM_CARDS;
  }

  get averageArmor() {
    return (this._totalArmor + this.currentArmor * (this.owner.currentTimestamp - this._lastBuffChange)) / (this.owner.fightDuration - this.deathTracker.totalTimeDead);
  }

  on_initialized() {
    const selected = this.combatants.selected;
    this.active = selected.hasTrinket(ITEMS.DARKMOON_DECK_IMMORTALITY.id);

    if(!this.active) {
      return;
    }

    const item = this.combatants.selected.getItem(ITEMS.DARKMOON_DECK_IMMORTALITY.id);
    Object.keys(BASE_ARMOR_PER_CARD).forEach(key => {
      this.ARMOR_PER_CARD[key] = calculateSecondaryStatDefault(BASE_IMMORTALITY_ILVL, BASE_ARMOR_PER_CARD[key], item.itemLevel);
    });
  }

  on_toPlayer_applybuff(event) {
    // actually adding armor gained to _totalArmor is done in removebuff
    //
    // Note that the keys of this.ARMOR_PER_CARD are returned as strings
    // by Object.keys() >.>
    if(Object.keys(this.ARMOR_PER_CARD).includes(String(event.ability.guid))) {
      this._lastBuffChange = event.timestamp;
      this.currentArmor = this.ARMOR_PER_CARD[event.ability.guid];
    }
  }

  on_toPlayer_removebuff(event) {
    if(Object.keys(this.ARMOR_PER_CARD).includes(String(event.ability.guid))) {
      this._totalArmor += this.currentArmor * (event.timestamp - this._lastBuffChange);
      this._lastBuffChange = event.timestamp;
      this.currentArmor = 0;
    }
  }

  item() {
    return {
      item: ITEMS.DARKMOON_DECK_IMMORTALITY,
      result: (<dfn data-tip={`Armor ranges from ${formatNumber(this.minArmor)}&ndash;${formatNumber(this.maxArmor)} with an expected average armor of ${formatNumber(this.expAverageArmor)}.`}>{formatNumber(this.averageArmor)} Armor gained on average.</dfn>),
    };
  }
}

export default DarkmoonDeckImmortality;
