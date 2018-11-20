import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';

/**
 * Your primary pet's Basic Attack deals more damage for each other pet you have active.
 * Basic Attacks are Claw, Smack and Bite.
 *
 * Basic Attack formula:
 * [(1 * 2 * 1 * 1 * (Ranged attack power * 0.333) * (1 + Versatility))]
 * Deals 100% more damage and costs 100% more Focus when your pet has 50 or more Focus.
 *
 * Example report: https://www.warcraftlogs.com/reports/m9KrNBVCtDALZpzT#source=5&type=summary&fight=1
 */

const debug = false;

//TODO: Accurately calculate total damage contribution - see work so far:
// https://github.com/Pewtro/WoWAnalyzer/blob/08872054615a54058fba06c590c9054aab1e9c00/src/parser/hunter/beastmastery/modules/spells/azeritetraits/PackAlpha.js
class PackAlpha extends Analyzer {

  traitBonus = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PACK_ALPHA.id);
    if (!this.active) {
      return;
    }
    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.PACK_ALPHA.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.PACK_ALPHA.id, rank)[0], 0);
    debug && console.log(`Pack Alpha bonus from items: ${this.traitBonus}`);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.PACK_ALPHA.id}
        value={`${this.traitBonus} bonus main pet Basic Attack damage`}
      />
    );
  }
}

export default PackAlpha;
