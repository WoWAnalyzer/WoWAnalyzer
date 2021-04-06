import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, { Event, DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';

import { ATONEMENT_DAMAGE_SOURCES } from '../../constants';
import isAtonement from './isAtonement';
import { SpiritShellEvent, SpiritShellApplied } from './SpiritShell';

export enum SourceProvenance {
  SpiritShell,
  Atonement,
}

export interface AtonementAnalyzerEvent extends Event<EventType.Atonement> {
  sourceID?: number;
  healEvent: HealEvent | SpiritShellEvent;
  damageEvent?: DamageEvent;
  provenance: SourceProvenance;
  targetID?: number;
}

export default class AtonementAnalyzer extends Analyzer {
  protected eventEmitter!: EventEmitter;

  /**
   * Event filter for damage events that will cause Atonement
   */
  static get atonementDamageSourceFilter() {
    return new EventFilter(EventType.AtonementDamage);
  }

  /**
   * Event filter for atonement
   * Contains both the healEvent and damageEvent
   */
  static get atonementEventFilter() {
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

  private atonementSource?: DamageEvent;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._processAtonement);
    this.addEventListener(Events.damage, this._processAtonementDamageSource);
    this.addEventListener(SpiritShellApplied, this._processSpiritShell);
  }

  /**
   * Filters damage events for those that could cause Atonement, and emits
   * the event for use by other modules
   *
   * @param {Object} damageEvent A damaging event
   */
  _processAtonementDamageSource(damageEvent: DamageEvent) {
    if (!ATONEMENT_DAMAGE_SOURCES[damageEvent.ability.guid]) {
      return;
    }
    if (damageEvent.targetIsFriendly) {
      return;
    } // Friendly fire doesn't cause atonement
    if (!AtonementAnalyzer.validHitTypes[damageEvent.hitType]) {
      return;
    }

    this.atonementSource = damageEvent;

    this.eventEmitter.fabricateEvent({
      ...damageEvent,
      type: AtonementAnalyzer.atonementDamageSourceFilter.eventType,
    });
  }

  _processSpiritShell(spiritShellEvent: SpiritShellEvent) {
    const evt: AtonementAnalyzerEvent = {
      timestamp: spiritShellEvent.timestamp,
      targetID: spiritShellEvent.targetID,
      healEvent: spiritShellEvent,
      damageEvent: this.atonementSource,
      sourceID: spiritShellEvent.sourceEvent.sourceID,
      provenance: SourceProvenance.SpiritShell,
      type: AtonementAnalyzer.atonementEventFilter.eventType,
    };

    this.eventEmitter.fabricateEvent(evt);
  }

  /**
   * Filters all healing events, and emits an event that contains both the
   * atonement event itself, and the associated damaging event
   *
   * @param {Object} healEvent A healing event
   */
  _processAtonement(healEvent: HealEvent) {
    const damageEvent = this.atonementSource;
    if (!damageEvent) {
      return;
    }
    if (!isAtonement(healEvent)) {
      return;
    }

    const evt: AtonementAnalyzerEvent = {
      timestamp: healEvent.timestamp,
      healEvent,
      damageEvent,
      sourceID: healEvent.sourceID,
      targetID: healEvent.targetID,
      type: AtonementAnalyzer.atonementEventFilter.eventType,
      provenance: SourceProvenance.Atonement,
    };

    this.eventEmitter.fabricateEvent(evt);
  }
}
