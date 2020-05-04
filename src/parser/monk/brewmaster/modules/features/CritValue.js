import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellLink from 'common/SpellLink';
import STAT, { getClassNameColor, getName } from 'parser/shared/modules/features/STAT';
import CelestialFortune from '../spells/CelestialFortune';

import MitigationSheet, { makeIcon } from '../features/MitigationSheet';

export default class CritValue extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    sheet: MitigationSheet,
    cf: CelestialFortune,
  };

  critBonusHealing = 0; // crit bonus healing from non-CF sources

  constructor(...args) {
    super(...args);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._handleHeal);
    this.sheet.registerStat(STAT.CRITICAL_STRIKE, this.statValue());
  }

  get bonusCritRatio() {
    return this.cf.bonusCritRatio;
  }

  _handleHeal(event) {
    if(event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    // counting absorbed healing because we live in a Vectis world
    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    this.critBonusHealing += Math.max(totalHeal / 2 - (event.overheal || 0), 0) * this.bonusCritRatio; // remove overhealing from the bonus healing
  }

  statValue() {
    const module = this;
    return {
      priority: 4,
      icon: makeIcon(STAT.CRITICAL_STRIKE),
      name: getName(STAT.CRITICAL_STRIKE),
      className: getClassNameColor(STAT.CRITICAL_STRIKE),
      statName: 'crit', // consistently inconsistent
      get gain() {
        return [
          { name: <><SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} /> Healing</>, amount: module.cf.critBonusHealing },
          { name: 'Critical Heals', amount: module.critBonusHealing },
        ];
      },
    };
  }
}
