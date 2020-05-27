import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage, formatThousands } from 'common/format';
import ItemHealingDone from 'interface/ItemHealingDone';
import HIT_TYPES from 'game/HIT_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';
import { HOLY_PRIEST_HEALING_INCREASE_AURA } from 'parser/priest/holy/constants';

/*
  Prayer of Healing restores an additional 988 health to the most injured ally it affects.
  Example Report: /report/Wjw8TPfgBKYbzF3k/3-Heroic+Champion+of+the+Light+-+Kill+(1:36)/11-Dinazorr
 */

const POH_MS_BUFFER = 100;

class PrayerfulLitany extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  lowestHealthHealEvent = null;
  numberOfHeals = 0;

  prayerOfHealingCasts = 0;
  lastPoHCast = 0;

  prayerfulLitanyHealing = 0;
  prayerfulLitanyOverHealing = 0;
  prayerfulLitanyBaseHealing = 0;
  get prayerfulLitanyProcHealing() {
    return this.prayerfulLitanyBaseHealing * (1 + this.statTracker.currentVersatilityPercentage) * (1 + HOLY_PRIEST_HEALING_INCREASE_AURA);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRAYERFUL_LITANY.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.PRAYERFUL_LITANY.id) || [];

    this.prayerfulLitanyBaseHealing = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.PRAYERFUL_LITANY.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  get totalPrayerfulLitanyHealing() {
    if (this.lowestHealthHealEvent !== null) {
      this._applyLowestHealthEvent();
    }
    return this.prayerfulLitanyHealing;
  }

  get totalPrayerfulLitanyOverhealing() {
    if (this.lowestHealthHealEvent !== null) {
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
      this.lastPoHCast = event.timestamp;
      this.prayerOfHealingCasts += 1;

      // If you hit yourself with prayer of healing, the heal event will fire before the cast event. This compensates for that.
      if (this.numberOfHeals > 1) {
        this._applyLowestHealthEvent();
      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PRAYER_OF_HEALING.id) {
      // If you hit yourself with prayer of healing, the heal event will fire before the cast event. This compensates for that.
      if (event.timestamp - this.lastPoHCast > POH_MS_BUFFER) {
        this._applyLowestHealthEvent();
      }

      this.numberOfHeals += 1;
      this.lowestHealthHealEvent = this._determineLitanyTarget(event, this.lowestHealthHealEvent);
    }
  }

  _determineLitanyTarget(event1, event2) {
    if (event2 == null) {
      return event1;
    }
    // normalize the healing from the two events
    const event1BaseHeal = (event1.hitType === HIT_TYPES.CRIT ? event1.amount / 2 : event1.amount);
    const event2BaseHeal = (event2.hitType === HIT_TYPES.CRIT ? event2.amount / 2 : event2.amount);
    // return the event with the highest normalized healing. It will be the one with prayerful litany.
    return (event1BaseHeal > event2BaseHeal) ? event1 : event2;
  }

  _applyLowestHealthEvent() {
    if (!this.lowestHealthHealEvent) {
      return;
    }
    let eventHealing = this.prayerfulLitanyProcHealing;
    let eventOverhealing = 0;

    if (this.lowestHealthHealEvent.hitType === HIT_TYPES.CRIT) {
      eventHealing *= 2;
    }
    if (this.lowestHealthHealEvent.overheal) {
      eventOverhealing = Math.min(eventHealing, this.lowestHealthHealEvent.overheal);
      eventHealing -= eventOverhealing;
    }

    this.prayerfulLitanyHealing += eventHealing;
    this.prayerfulLitanyOverHealing += eventOverhealing;
    this.lowestHealthHealEvent = null;
    this.numberOfHeals = 0;
  }

  statistic() {
    if (this.lowestHealthHealEvent !== null) {
      this._applyLowestHealthEvent();
    }
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PRAYERFUL_LITANY.id}
        value={(
          <ItemHealingDone amount={this.prayerfulLitanyHealing} />
        )}
        tooltip={`Total Healing: ${formatThousands(this.prayerfulLitanyHealing)} (${formatPercentage(this.prayerfulLitanyOverHealing / this.rawPrayerfulLitanyHealing)}% OH)`}
      />
    );
  }
}

export default PrayerfulLitany;
