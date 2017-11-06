import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import { HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR } from '../../Constants';

// This modules estimates Essence of G'hanir healing. Since the ability increases the tick rate of all HoTs by 100%
// we can assume that half of all the healing (from the HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR array) is contributed.
class EssenceOfGhanir extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  total = 0;

  rejuvenation = 0;
  wildGrowth = 0;
  cenarionWard = 0;
  cultivation = 0;
  lifebloom = 0;
  regrowth = 0;
  dreamer = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if (this.combatants.selected.hasBuff(SPELLS.ESSENCE_OF_GHANIR.id) && HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR.includes(spellId)) {
      switch (spellId) {
        case SPELLS.REJUVENATION.id:
          this.rejuvenation += amount / 2;
          break;
        case SPELLS.REJUVENATION_GERMINATION.id:
          this.rejuvenation += amount / 2;
          break;
        case SPELLS.WILD_GROWTH.id:
          this.wildGrowth += amount / 2;
          break;
        case SPELLS.CENARION_WARD.id:
          this.cenarionWard += amount / 2;
          break;
        case SPELLS.CULTIVATION.id:
          this.cultivation += amount / 2;
          break;
        case SPELLS.LIFEBLOOM_HOT_HEAL.id:
          this.lifebloom += amount / 2;
          break;
        case SPELLS.REGROWTH.id:
          if (event.tick === true) {
            this.regrowth += amount / 2;
          }
          break;
        case SPELLS.DREAMER.id:
          this.dreamer += amount / 2;
          break;
        default:
          console.error('EssenceOfGhanir: Error, could not identify this object as a HoT: %o', event);
      }

      if (SPELLS.REGROWTH.id === spellId && event.tick !== true) {
        return;
      }
      this.total += amount / 2;
    }
  }

  statistic() {
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(this.total);
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ESSENCE_OF_GHANIR.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label="Essence of G'hanir"
        tooltip={
          `<ul>
            ${this.wildGrowth === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.wildGrowth))}% from Wild Growth</li>`}
            ${this.rejuvenation === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rejuvenation))}% from Rejuvenation</li>`}
            ${this.cenarionWard === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.cenarionWard))}% from Cenarion Ward</li>`}
            ${this.lifebloom === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.lifebloom))}% from Lifebloom</li>`}
            ${this.regrowth === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.regrowth))}% from Regrowth</li>`}
            ${this.cultivation === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.cultivation))}% from Cultivation</li>`}
            ${this.dreamer === 0 ? '' :
            `<li>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.dreamer))}% from Dreamer (T21 2pc)</li>`}
          </ul>`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default EssenceOfGhanir;
