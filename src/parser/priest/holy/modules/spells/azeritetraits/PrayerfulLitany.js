import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage, formatThousands } from 'common/format';
import ItemHealingDone from 'interface/others/ItemHealingDone';

/*
  Prayer of Healing restores an additional 988 health to the most injured ally it affects.
  Example Report: /report/Wjw8TPfgBKYbzF3k/3-Heroic+Champion+of+the+Light+-+Kill+(1:36)/11-Dinazorr
 */
class PrayerfulLitany extends Analyzer {
  lowestHealthHealEvent = null;
  numberOfHeals = 0;

  prayerOfHealingCasts = 0;
  prayerfulLitanyHealing = 0;
  prayerfulLitanyOverHealing = 0;

  prayerfulLitanyProcHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRAYERFUL_LITANY.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.PRAYERFUL_LITANY.id) || [];

    this.prayerfulLitanyProcHealing = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.PRAYERFUL_LITANY.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  get totalPrayerfulLitanyHealing() {
    if (this.lowestHealthHealEvent != null) {
      this._applyLowestHealthEvent();
    }
    return this.prayerfulLitanyHealing;
  }

  get totalPrayerfulLitanyOverhealing() {
    if (this.lowestHealthHealEvent != null) {
      this._applyLowestHealthEvent();
    }
    return this.prayerfulLitanyOverHealing;
  }

  get rawPrayerfulLitanyHealing() {
    return this.totalPrayerfulLitanyHealing + this.totalPrayerfulLitanyOverhealing;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_HEALING.id) {
      this.prayerOfHealingCasts++;
      if (this.lowestHealthHealEvent != null && this.numberOfHeals > 1) {
        this._applyLowestHealthEvent();
      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_HEALING.id) {
      if (this.numberOfHeals >= 5) {
        this._applyLowestHealthEvent();
      }
      this.numberOfHeals += 1;
      if (this.lowestHealthHealEvent == null || event.hitPoints < this.lowestHealthHealEvent.hitPoints) {
        this.lowestHealthHealEvent = event;
      }
    }
  }

  _applyLowestHealthEvent() {
    let eventHealing = this.prayerfulLitanyProcHealing;
    let eventOverhealing = 0;

    if (this.lowestHealthHealEvent.overheal) {
      eventOverhealing = Math.min(this.prayerfulLitanyProcHealing, this.lowestHealthHealEvent.overheal);
      eventHealing -= eventOverhealing;
    }

    this.prayerfulLitanyHealing += eventHealing;
    this.prayerfulLitanyOverHealing += eventOverhealing;
    this.lowestHealthHealEvent = null;
    this.numberOfHeals = 0;
  }

  statistic() {
    if (this.lowestHealthHealEvent != null) {
      this._applyLowestHealthEvent();
    }
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PRAYERFUL_LITANY.id}
        value={<ItemHealingDone amount={this.prayerfulLitanyHealing} />}
        tooltip={`Total Healing: ${formatThousands(this.prayerfulLitanyHealing)} (${formatPercentage(this.prayerfulLitanyOverHealing / this.rawPrayerfulLitanyHealing)}% OH)`}
      />
    );
  }
}

export default PrayerfulLitany;
