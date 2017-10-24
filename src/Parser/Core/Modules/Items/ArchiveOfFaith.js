import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class ArchiveOfFaith extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  casts = 0;
  healing = 0;
  healingOverTime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ARCHIVE_OF_FAITH.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CLEANSING_MATRIX.id) {
      this.casts += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CLEANSING_MATRIX.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.AOF_INFUSION_OF_LIGHT.id) {
      debug && console.log(`HOT Casted: ${event.amount}`);
      this.healingOverTime += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Healing: ${this.healing}`);
      console.log(`Casts ${this.casts}`);
      console.log(`HOT: ${this.healingOverTime}`);
    }
  }

  item() {
    const archiveOfFaithHealing = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const archiveOfFaithHOTHealing = this.owner.getPercentageOfTotalHealingDone(this.healingOverTime);
    const archiveOfFaithHealingTotal = this.owner.getPercentageOfTotalHealingDone(this.healing + this.healingOverTime);
    return {
      item: ITEMS.ARCHIVE_OF_FAITH,
      result: (
        <dfn
          data-tip={`The effective healing contributed by the Archive of Faith on-use effect.<br />
            Channel: ${((archiveOfFaithHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.healing / this.owner.fightDuration * 1000)} HPS<br />
            HOT: ${((archiveOfFaithHOTHealing * 100) || 0).toFixed(2)} % / ${formatNumber(this.healingOverTime / this.owner.fightDuration * 1000)} HPS`}
        >
          {((archiveOfFaithHealingTotal * 100) || 0).toFixed(2)} % / {formatNumber((this.healing + this.healingOverTime) / this.owner.fightDuration * 1000)} HPS
        </dfn>
      ),
    };
  }
}

export default ArchiveOfFaith;
