import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';
import StatisticBox from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';

import { BASE_AGI, GIFT_OF_THE_OX_SPELLS } from '../../constants';

const GOTOX_COEFF = 1.5;
const ORB_DURATION = 30000;
const MAX_ORBS = 5;

export default class GiftOfTheOx extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  }

  totalHealing = 0;
  agiBonusHealing = 0;

  orbsGenerated = 0;
  orbsConsumed = 0;
  cappedOrbs = 0;
  expiredOrbs = 0;

  expelHarmCasts = 0;
  expelHarmOrbsConsumed = 0;
  expelHarmOverhealing = 0;

  _currentOrbs = [];
  _lastEHTimestamp = null;

  get orbsMovedOver() {
    return this.orbsConsumed - this.expelHarmOrbsConsumed - this.cappedOrbs - this.expiredOrbs;
  }

  constructor(...args) {
    super(...args);
    this.addEventListener(new EventFilter('tick').by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS), this._orbGenerated);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this._expelCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS), this._gotoxHeal);
    this.addEventListener(Events.death.by(SELECTED_PLAYER), this._clearOrbs);
  }

  _clearOrbs(event) {
    this._currentOrbs.length = 0;
  }

  _orbGenerated(event) {
    this.orbsGenerated += 1;
    this._currentOrbs.push(event);
  }

  _expelCast(event) {
    this.expelHarmCasts += 1;
    this._lastEHTimestamp = event.timestamp;
  }

  _gotoxHeal(event) {
    this.orbsConsumed += 1;
    this.totalHealing += event.amount;
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
    this.agiBonusHealing += GOTOX_COEFF * (1 + this.stats.currentMasteryPercentage) * (1 + this.stats.currentVersatilityPercentage) * (this.stats.currentAgilityRating - BASE_AGI);

    if(event.timestamp === this._lastEHTimestamp) {
      this.expelHarmOrbsConsumed += 1;
      this.expelHarmOverhealing += event.overheal || 0;
    } else if(event.timestamp - ORB_DURATION - this._currentOrbs[0].timestamp < 100) {
      this.expiredOrbs += 1;
    } else if(this._currentOrbs.length > MAX_ORBS) {
      this.cappedOrbs += 1;
    }
    this._currentOrbs.shift();
  }
}
