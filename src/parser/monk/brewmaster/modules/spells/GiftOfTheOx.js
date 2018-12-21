import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';
import StatisticBox from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';

import { BASE_AGI, GIFT_OF_THE_OX_SPELLS } from '../../constants';

const GOTOX_COEFF = 1.5;

/**
 * Gift of the Ox
 *
 * Generated healing spheres when struck, which heal for 1.5x AP when
 * consumed by walking over, expiration, overcapping, or casting
 * Expel Harm.
 *
 * See peak for a breakdown of how it works and all its quirks:
 * https://www.peakofserenity.com/2018/10/06/gift-of-the-ox/
 */
export default class GiftOfTheOx extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  }

  totalHealing = 0;
  agiBonusHealing = 0;
  masteryBonusHealing = 0;

  orbsGenerated = 0;
  orbsConsumed = 0;

  expelHarmCasts = 0;
  expelHarmOrbsConsumed = 0;
  expelHarmOverhealing = 0;

  _lastEHTimestamp = null;

  constructor(...args) {
    super(...args);
    this.addEventListener(new EventFilter('tick').by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS), this._orbGenerated);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this._expelCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS), this._gotoxHeal);
  }

  _orbGenerated(event) {
    this.orbsGenerated += 1;
  }

  _expelCast(event) {
    this.expelHarmCasts += 1;
    this._lastEHTimestamp = event.timestamp;
  }

  _gotoxHeal(event) {
    this.orbsConsumed += 1;
    this.totalHealing += event.amount;

    // REMINDER: check this math in the morning
    const masteryAmount = (1 - this.stats.masteryPercentage(0, true) / this.stats.currentMasteryPercentage) * (event.amount + (event.absorbed || 0) + (event.overheal || 0));
    const remainingOverheal = Math.max(0, (event.overheal || 0) - masteryAmount);
    this.masteryBonusHealing += Math.max(0, masteryAmount - (event.overheal || 0));
    // so the formula for the healing is
    //
    // Heal = 1.5 * (6 * WDPS + BonusAgi + BaseAgi) * Mastery * Vers
    //
    // With BaseAgi known, we get:
    //
    // BonusHeal = 1.5 * (6 * WDPS + BonusAgi + BaseAgi) * Mastery * Vers - 1.5 * (6 * WDPS + BaseAgi) * Mastery * Vers
    //           = Heal * (1 - (6 WDPS + BaseAgi) / (6 WDPS + BonusAgi + BaseAgi))
    //
    // but WDPS is unknown, so we need to reformulate it as
    // = 1.5 * Mastery * Vers * (6 * WDPS + BonusAgi + BaseAgi - 6 * WDPS - BaseAgi)
    // = 1.5 * Mastery * Vers * BonusAgi
    //
    // and just rely on the stattracker being close enough :shrug:
    const agiAmount = GOTOX_COEFF * (1 + this.stats.currentMasteryPercentage) * (1 + this.stats.currentVersatilityPercentage) * (this.stats.currentAgilityRating - BASE_AGI);
    this.agiBonusHealing += Math.max(agiAmount - remainingOverheal, 0);

    if(event.timestamp === this._lastEHTimestamp) {
      this.expelHarmOrbsConsumed += 1;
      this.expelHarmOverhealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={GIFT_OF_THE_OX_SPELLS[0].id} />}
        label={"Gift of the Ox Healing"}
        value={`${formatNumber(this.totalHealing / (this.owner.fightDuration / 1000))} HPS`}
        tooltip={`You generated ${formatNumber(this.orbsGenerated)} healing spheres and consumed ${formatNumber(this.orbsConsumed)} of them. ${formatNumber(this.expelHarmOrbsConsumed)} of these were consumed with Expel Harm over ${formatNumber(this.expelHarmCasts)} casts.`}
      />
    );
  }
}
