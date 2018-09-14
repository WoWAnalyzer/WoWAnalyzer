import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage, formatThousands } from 'common/format';

// Example Log: https://www.warcraftlogs.com/reports/7rLHkgCBhJZ3t1KX#fight=6&type=healing
class PrayerfulLitany extends Analyzer {
  lastPoHCastTime = 0;
  lowestHealthTarget = Infinity;
  lowestHealthHealEvent = null;

  prayerOfHealingCasts = 0;
  prayerfulLitanyHealing = 0;
  prayerfulLitanyOverHealing = 0;

  prayerfulLitanyHealingBonus = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRAYERFUL_LITANY.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.PRAYERFUL_LITANY.id) || [];

    this.prayerfulLitanyHealingBonus = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.PRAYERFUL_LITANY.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
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
      if (this.lowestHealthHealEvent != null) {
        this._applyLowestHealthEvent();
      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_HEALING.id) {
      if (this.lowestHealthHealEvent == null || event.hitPoints < this.lowestHealthHealEvent.hitPoints) {
        this.lowestHealthHealEvent = event;
      }
    }
  }

  _applyLowestHealthEvent() {
    let eventHealing = this.prayerfulLitanyHealingBonus;
    let eventOverhealing = 0;

    if (this.lowestHealthHealEvent.overheal) {
      eventOverhealing = Math.min(this.prayerfulLitanyHealingBonus, this.lowestHealthHealEvent.overheal);
      eventHealing -= eventOverhealing;
    }

    this.prayerfulLitanyHealing += eventHealing;
    this.prayerfulLitanyOverHealing += eventOverhealing;
    this.lowestHealthHealEvent = null;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PRAYERFUL_LITANY.id}
        value={(
          <React.Fragment>
            {formatThousands(this.prayerfulLitanyHealing)} Bonus Healing<br />
            {formatPercentage(this.prayerfulLitanyOverHealing / this.rawPrayerfulLitanyHealing)}% Overhealing
          </React.Fragment>
        )}
        tooltip={`
          ${formatThousands(this.prayerfulLitanyOverHealing)} total overhealing.
        `}
      />
    );
  }
}

export default PrayerfulLitany;
