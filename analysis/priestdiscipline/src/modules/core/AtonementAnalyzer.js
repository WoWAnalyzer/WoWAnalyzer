import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import EventFilter from 'parser/core/EventFilter';
import HIT_TYPES from 'game/HIT_TYPES';

import { ATONEMENT_DAMAGE_SOURCES } from '../../constants';
import isAtonement from './isAtonement';

export default class AtonementAnalyzer extends Analyzer {
  /**
   * Event filter for damage events that will cause
   */
  get atonementDamageSourceFilter() {
    return new EventFilter(EventType.AtonementDamage);
  }

  /**
   * Event filter for atonement
   * Contains both the healEvent and damageEvent
   */
  get atonementEventFilter() {
    return new EventFilter(EventType.Atonement);
  }

  static dependencies = {
    eventEmitter: EventEmitter,
  };
  static validHitTypes = {
    [HIT_TYPES.NORMAL]: true,
    [HIT_TYPES.CRIT]: true,
    [HIT_TYPES.ABSORB]: true,
  };
  _atonementSource = null;

  constructor(options) {
    super(options);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._processAtonement);
    this.addEventListener(Events.damage, this._processAtonementDamageSource);
  }

  /**
   * Filters damage events for those that could cause Atonement, and emits
   * the event for use by other modules
   *
   * @param {Object} damageEvent A damaging event
   */
  _processAtonementDamageSource(damageEvent) {
    if (!ATONEMENT_DAMAGE_SOURCES[damageEvent.ability.guid]) {
      return;
    }
    if (damageEvent.targetIsFriendly) {
      return;
    } // Friendly fire doesn't cause atonement
    if (!AtonementAnalyzer.validHitTypes[damageEvent.hitType]) {
      return;
    }

    this._atonementSource = damageEvent;

    this.eventEmitter.fabricateEvent({
      ...damageEvent,
      type: this.atonementDamageSourceFilter.eventType,
    });
  }

  /**
   * Filters all healing events, and emits an event that contains both the
   * atonement event itself, and the associated damaging event
   *
   * @param {Object} healEvent A healing event
   */
  _processAtonement(healEvent) {
    const damageEvent = this._atonementSource;
    if (!damageEvent) {
      return;
    }
    if (!isAtonement(healEvent)) {
      return;
    }

    this.eventEmitter.fabricateEvent({
      healEvent,
      damageEvent,
      sourceID: healEvent.sourceID,
      type: this.atonementEventFilter.eventType,
    });
  }
}
