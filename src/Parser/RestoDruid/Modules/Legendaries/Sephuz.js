import React from 'react';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import CoreSephuz from 'Parser/Core/Modules/Items/SephuzsSecret';

export const SEPHUZ_ITEM_ID = 132452;

// 1% Haste is worth 375 haste rating.
const ONE_PERCENT_HASTE_RATING = 375;
const SEPHUZ_PROCC_HASTE = 25;

class Sephuz extends CoreSephuz {
  static dependencies = {
    combatants: Combatants,
  };
  uptime = 0;
  throughput = 0;
  sephuzProccInHasteRating = SEPHUZ_PROCC_HASTE * ONE_PERCENT_HASTE_RATING;
  sephuzStaticHasteInRating = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.combatants.selected.hasFinger(ITEMS.SEPHUZS_SECRET.id);
    }
    this.sephuzStaticHasteInRating = ((this.owner.modules.combatants.selected.hastePercentage + 1) - ((this.owner.modules.combatants.selected.hastePercentage + 1) / 1.02)) * 100 * ONE_PERCENT_HASTE_RATING;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SEPHUZS_SECRET_BUFF.id) {
      this.uptime += 10000;
      console.log(`Uptime: ${this.uptime}`);
    }
  }

  // overrides Core implemented Sephuz module
  item() {
    const sepuhzHasteRating = ((this.uptime / this.owner.fightDuration) * this.sephuzProccInHasteRating) + this.sephuzStaticHasteInRating;
    const sephuzThroughput = sepuhzHasteRating / this.combatants.selected.intellect;
    return {
      item: ITEMS.SEPHUZS_SECRET,
      result: (
        <dfn data-tip="Estimated throughput gained by using Sephuz by calculating haste gained in throughput, given 1 haste = 1 INT.">
          {((sephuzThroughput * 100) || 0).toFixed(2)} %
        </dfn>
      ),
    };
  }
}

export default Sephuz;
