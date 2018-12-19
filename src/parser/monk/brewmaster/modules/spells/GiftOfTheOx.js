import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatisticBox from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';

import { BASE_AGI, GIFT_OF_THE_OX_SPELLS } from '../../constants';

const GOTOX_COEFF = 1.5;

export default class GiftOfTheOx extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  }

  _queuedHeals = [];

  totalHealing = 0;
  agiBonusHealing = 0;
  orbsConsumed = 0;
  orbsMovedOver = 0;

  expelHarmCasts = 0;
  expelHarmOrbsConsumed = 0;
  expelHarmOverhealing = 0;

  _position = null;

  get orbsConsumedByCap() {
    return this.orbsConsumed - this.orbsMovedOver - this.expelHarmOrbsConsumed;
  }

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this._expelCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(GIFT_OF_THE_OX_SPELLS), this._gotoxHeal);
    // position tracking to try to distinguish between orbs consumed by
    // cap (5) and orbs consumed by movement.
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._updatePosition);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._updatePosition);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._updatePosition);
  }

  _expelCast(event) {
    this.expelHarmCasts += 1;
    this._queuedHeals.filter(({timestamp}) => timestamp === event.timestamp)
      .forEach(event => {
        this.expelHarmOrbsConsumed += 1;
        this.expelHarmOverhealing += event.overheal || 0;
      });
    this._queuedHeals.length = 0;
  }

  _gotoxHeal(event) {
    console.log('gotox heal')
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

    if(event.x !== this._position.x || event.y !== this._position.y) {
      this.orbsMovedOver += 1;
    }

    this._queuedHeals.push(event);
  }

  _updatePosition(event) {
    if(GIFT_OF_THE_OX_SPELLS.map(({id}) => id).includes(event.ability.guid)) {
      console.log('update pos');
    }
    if(event.x === undefined || event.y === undefined) {
      return;
    }
    this._position = {
      x: event.x,
      y: event.y,
    };
  }
}
