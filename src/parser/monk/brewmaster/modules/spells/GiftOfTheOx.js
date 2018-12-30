import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { calculatePrimaryStat } from 'common/stats';
import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatisticBox from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';

import { BASE_AGI, GIFT_OF_THE_OX_SPELLS } from '../../constants';
import { GOTOX_GENERATED_EVENT } from '../../normalizers/GiftOfTheOx';

const WDPS_BASE_ILVL = 310;
const WDPS_310_AGI_POLEARM = 122.8;

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
  wdpsBonusHealing = 0;
  _baseAgiHealing = 0;
  masteryBonusHealing = 0;
  _wdps = 0;

  orbsGenerated = 0;
  orbsConsumed = 0;

  expelHarmCasts = 0;
  expelHarmOrbsConsumed = 0;
  expelHarmOverhealing = 0;

  _lastEHTimestamp = null;

  _wdps = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(GOTOX_GENERATED_EVENT, this._orbGenerated);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this._expelCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS), this._gotoxHeal);

    this._wdps = calculatePrimaryStat(WDPS_BASE_ILVL, WDPS_310_AGI_POLEARM, this.selectedCombatant.mainHand.itemLevel);
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
    const amount = event.amount + (event.absorbed || 0);
    this.totalHealing += amount;

    // so the formula for the healing is
    //
    // Heal = 1.5 * (6 * WDPS + BonusAgi + BaseAgi) * Mastery * Vers
    //
    // With BaseAgi known, we get:
    //
    // BonusHeal = 1.5 * (6 * WDPS + BonusAgi + BaseAgi) * Mastery * Vers - 1.5 * (6 * WDPS + BaseAgi) * Mastery * Vers
    //           = Heal * (1 - (6 WDPS + BaseAgi) / (6 WDPS + BonusAgi + BaseAgi))
    //           = Heal * (BonusAgi / (6 WDPS + BonusAgi + BaseAgi))
    //
    // and similar for bonus WDPS healing and base agi healing
    const denom = (6 * this._wdps + this.stats.currentAgilityRating);
    this.agiBonusHealing += amount * (this.stats.currentAgilityRating - BASE_AGI) / denom;
    this.wdpsBonusHealing += amount * 6 * this._wdps / denom;
    this._baseAgiHealing += amount * BASE_AGI / denom;
    // MasteryBonusHeal = 1.5 * AP * (1 + BonusMastery + BaseMastery) * Vers - 1.5 * AP * (1 + BaseMastery) * Vers
    //                  = Heal * (1 - (1 + BaseMastery) / (1 + BonusMastery + BaseMastery))
    //                  = Heal * BonusMastery / (1 + BonusMastery + BaseMastery)
    this.masteryBonusHealing += amount * (this.stats.currentMasteryPercentage - this.stats.masteryPercentage(0, true)) / (1 + this.stats.currentMasteryPercentage);

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
        tooltip={`You generated ${formatNumber(this.orbsGenerated)} healing spheres and consumed ${formatNumber(this.orbsConsumed)} of them, healing for <b>${formatNumber(this.totalHealing)}</b>. ${formatNumber(this.expelHarmOrbsConsumed)} of these were consumed with Expel Harm over ${formatNumber(this.expelHarmCasts)} casts.`}
      />
    );
  }
}
