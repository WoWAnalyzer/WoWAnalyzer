import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/shared/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox from 'interface/others/StatisticBox';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import { REDUCTION_TIME as RP_REDUCTION_TIME } from '../talents/RighteousProtector';

const HEAL_DELAY_THRESHOLD = 2000;

export default class LightOfTheProtector extends Analyzer {
  static dependencies = {
    spells: SpellUsable,
    abilities: Abilities,
  };

  _lastHit = null;
  _msTilHeal = 0;
  _delays = [];

  _activeSpell = SPELLS.LIGHT_OF_THE_PROTECTOR;

  constructor(props) {
    super(props);
    if(this.selectedCombatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id)) {
      this._activeSpell = SPELLS.HAND_OF_THE_PROTECTOR_TALENT;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._startDelayTimer);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this._activeSpell), this._countDelay);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(this._activeSpell), this._countHeal);

    if(this.selectedCombatant.hasTalent(SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id)) {
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this._updateDelayRP);
    }
  }

  _startDelayTimer(event) {
    this._lastHit = event;
    this._msTilHeal = this.spells.isAvailable(this._activeSpell.id) ? 0 : this.spells.cooldownRemaining(this._activeSpell.id);
  }

  // update the delay based on SotR cast with the RP talent, which
  // reduces LotP/HotP CD by 3s
  _updateDelayRP(event) {
    const delayFromHit = event.timestamp - this._lastHit.timestamp;
    this._msTilHeal -= RP_REDUCTION_TIME;
    // we couldn't cast the heal before the current event happened
    if(this._msTilHeal < delayFromHit) {
      this._msTilHeal = delayFromHit;
    }
  }

  _countDelay(event) {
    const delay = event.timestamp - this._lastHit.timestamp - this._msTilHeal;
    if(delay < 0) {
      console.error("LotP/HotP delay came out negative", delay);
    }
    this._delays.push(delay);

    if(delay < HEAL_DELAY_THRESHOLD) {
      return; // nothing left to do
    }

    const meta = event.meta || {
      inefficientCastReason: `This ${this._activeSpell.name} cast was inefficient because:`,
    };
    meta.inefficientCastReason += `<br/> - You delayed casting it for <b>${(delay / 1000).toFixed(2)}s</b> after being hit.`;
    meta.isInefficientCast = true;
    event.meta = meta;
  }

  _countHeal(event) {

  }

  get avgDelay() {
    if(this._delays.length === 0) {
      return 0;
    }

    return this._delays.reduce((sum, delay) => sum + delay, 0) / this._delays.length;
  }

  get delaySuggestion() {
    return {
      actual: this.avgDelay / 1000,
      isGreaterThan: {
        minor: 1.5,
        average: HEAL_DELAY_THRESHOLD / 1000,
        major: HEAL_DELAY_THRESHOLD / 1000 + 1,
      },
      style: 'seconds',
    };
  }

  suggestions(when) {
    when(this.delaySuggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You should delay your <SpellLink id={this._activeSpell.id} /> cast as little as possible after being hit to maximize its effect and to minimize the chance that you waste healing resources.</>)
        .icon(SPELLS.LIGHT_OF_THE_PROTECTOR.icon)
        .actual(`${actual.toFixed(2)}s Average Delay`)
        .recommended(`< ${recommended.toFixed(2)}s is recommended`);
    });
  }
}
