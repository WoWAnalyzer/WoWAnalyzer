import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { REDUCTION_TIME as RP_REDUCTION_TIME } from '../talents/RighteousProtector';

const HEAL_DELAY_THRESHOLD = 2000;

/**
 * Light of the Protector / Hand of the Protector shared analysis
 *
 * Many of the behaviors are shared between the two abilities, and this
 * module handles those.
 *
 * Behavior specific to HotP should be placed in a separate
 * HandOfTheProtector module.
 *
 * Sample Log: https://www.warcraftlogs.com/reports/WP3FTxYwkLXyVRac/#fight=2&source=20
 */
export default class LightOfTheProtector extends Analyzer {
  static dependencies = {
    spells: SpellUsable,
    abilities: Abilities,
  };

  _lastHit = null;
  _msTilHeal = 0;
  _delays = [];

  activeSpell = SPELLS.LIGHT_OF_THE_PROTECTOR;

  _overhealing = 0;
  _actualHealing = 0;

  constructor(props) {
    super(props);
    if (this.selectedCombatant.hasTalent(TALENTS.HAND_OF_THE_PROTECTOR_TALENT)) {
      this.activeSpell = TALENTS.HAND_OF_THE_PROTECTOR_TALENT;
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(this.activeSpell),
        this._countDelay,
      );
    } else {
      // LotP has no target, so .to(SELECTED_PLAYER) filters out ALL
      // casts
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell),
        this._countDelay,
      );
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._startDelayTimer);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(this.activeSpell), this._countHeal);

    if (this.selectedCombatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS),
        this._updateDelayRP,
      );
    }
  }

  _startDelayTimer(event) {
    this._lastHit = event;
    this._msTilHeal = this.spells.isAvailable(this.activeSpell.id)
      ? 0
      : this.spells.cooldownRemaining(this.activeSpell.id);
  }

  // update the delay based on SotR cast with the RP talent, which
  // reduces LotP/HotP CD by 3s
  _updateDelayRP(event) {
    if (!this._lastHit || this._msTilHeal === 0) {
      return;
    }
    const delayFromHit = event.timestamp - this._lastHit.timestamp;
    this._msTilHeal -= RP_REDUCTION_TIME;
    // we couldn't cast the heal before the current event happened
    if (this._msTilHeal < delayFromHit) {
      this._msTilHeal = delayFromHit;
    }
  }

  _countDelay(event) {
    if (this._lastHit === null) {
      // haven't been hit yet, might have started with less than 100% hp
      // (or are fighting Mythrax)
      return;
    }
    const delay = event.timestamp - (this._lastHit ? this._lastHit.timestamp : 0) - this._msTilHeal;
    if (delay < 0) {
      console.error('LotP/HotP delay came out negative', delay);
    }
    this._delays.push(delay);

    if (delay < HEAL_DELAY_THRESHOLD) {
      return; // nothing left to do
    }

    const meta = event.meta || {
      inefficientCastReason: `This ${this.activeSpell.name} cast was inefficient because:`,
    };
    meta.inefficientCastReason += `<br/> - You delayed casting it for <b>${(delay / 1000).toFixed(
      2,
    )}s</b> after being hit.`;
    meta.isInefficientCast = true;
    event.meta = meta;
  }

  _countHeal(event) {
    const overhealing = event.overheal || 0;
    this._overhealing += overhealing;
    this._actualHealing += event.amount;

    if (overhealing === 0 || event.hitType === HIT_TYPES.CRIT) {
      return; // not gonna penalize overhealing on crits because it heals for SO MUCH
    }

    const meta = event.meta || {
      inefficientCastReason: `This ${this.activeSpell.name} cast was inefficient because:`,
    };
    meta.inefficientCastReason += `<br/> - You cast it while at high health, causing it to overheal for ${formatNumber(
      overhealing,
    )}.`;
    meta.isInefficientCast = true;
    event.meta = meta;
  }

  get avgDelay() {
    if (this._delays.length === 0) {
      return 0;
    }

    return this._delays.reduce((sum, delay) => sum + delay, 0) / this._delays.length;
  }

  get overhealRatio() {
    return this._overhealing / (this._overhealing + this._actualHealing) || 0;
  }

  get overhealSuggestion() {
    return {
      actual: this.overhealRatio,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
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
    when(this.delaySuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should delay your <SpellLink id={this.activeSpell.id} /> cast as little as possible
          after being hit to maximize its effect and to minimize the chance that you waste healing
          resources.
        </>,
      )
        .icon(SPELLS.LIGHT_OF_THE_PROTECTOR.icon)
        .actual(
          t({
            id: 'paladin.protection.suggestions.lightOfTheProtector.averageDelay',
            message: `${actual.toFixed(2)}s Average Delay`,
          }),
        )
        .recommended(`< ${recommended.toFixed(2)}s is recommended`),
    );

    when(this.overhealSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should avoid casting <SpellLink id={this.activeSpell.id} /> while at very high health
          to avoid overhealing.
        </>,
      )
        .icon(SPELLS.LIGHT_OF_THE_PROTECTOR.icon)
        .actual(
          t({
            id: 'paladin.protection.suggestions.lightOfTheProtector.overhealing',
            message: `${formatPercentage(actual)}% Overhealing`,
          }),
        )
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
