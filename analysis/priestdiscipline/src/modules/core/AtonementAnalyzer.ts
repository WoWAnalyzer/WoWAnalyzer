import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  Event,
  DamageEvent,
  EventType,
  HealEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
  CastEvent,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';

import { ATONEMENT_DAMAGE_SOURCES } from '../../constants';
import AtonementApplicationSource from '../features/AtonementApplicationSource';
import isAtonement from './isAtonement';
import { SpiritShellEvent, SpiritShellApplied } from './SpiritShell';

export enum SourceProvenance {
  SpiritShell = 'SpiritShell',
  Atonement = 'Atonement',
}

export interface AtonementAnalyzerEvent extends Event<EventType.Atonement> {
  // The ID of the unit that case the spell, typically the player
  sourceID?: number;
  // The healing event caused by the damage
  healEvent: HealEvent | SpiritShellEvent;
  // The damage event that caused the healing
  damageEvent?: DamageEvent;
  // The details about the Atonement buff that caused the heal
  buffDetails?: BuffWithSource;
  // The source of the healing, either SpiritShell or regular Atonement
  provenance: SourceProvenance;
  // The target ID of the unit being healed
  targetID?: number;
  // The time until/since the buff should have expired
  expirationDelta?: number;
}

interface BuffWithSource {
  // The atonement buff in question
  buffEvent: ApplyBuffEvent | RefreshBuffEvent;
  // The cast that caused
  castEvent: CastEvent;
  // Base expiration expected
  baseExpirationTimestamp: number;
}

export default class AtonementAnalyzer extends Analyzer {
  protected eventEmitter!: EventEmitter;
  protected atonementApplicationSource!: AtonementApplicationSource;

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
    atonementApplicationSource: AtonementApplicationSource,
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

    /**
     * Track successful atonement applicator casts
     */
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.POWER_WORD_RADIANCE, SPELLS.SHADOW_MEND, SPELLS.POWER_WORD_SHIELD]),
      this.handleCastSuccess,
    );

    /**
     * Track atonement buff applications
     */
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.handleAtonementBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF),
      this.handleAtonementBuff,
    );
  }

  private castEvent?: CastEvent;
  handleCastSuccess(event: CastEvent) {
    this.castEvent = event;
  }

  private targetBuffSourceMap: Map<number, BuffWithSource> = new Map();
  handleAtonementBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!this.castEvent) {
      return;
    }

    const expectedDuration = this.atonementApplicationSource.duration.get(
      this.castEvent.ability.guid,
    );

    const { targetID } = event;
    this.targetBuffSourceMap.set(targetID, {
      buffEvent: event,
      castEvent: this.castEvent,
      baseExpirationTimestamp: event.timestamp + (expectedDuration || 0),
    });
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
    const buffDetails = this.targetBuffSourceMap.get(spiritShellEvent.targetID);

    if (!buffDetails) {
      return;
    }

    const evt: AtonementAnalyzerEvent = {
      timestamp: spiritShellEvent.timestamp,
      targetID: spiritShellEvent.targetID,
      healEvent: spiritShellEvent,
      damageEvent: this.atonementSource,
      sourceID: spiritShellEvent.sourceEvent.sourceID,
      provenance: SourceProvenance.SpiritShell,
      type: AtonementAnalyzer.atonementEventFilter.eventType,
      buffDetails,
      expirationDelta: buffDetails.baseExpirationTimestamp - spiritShellEvent.timestamp,
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
    const buffDetails = this.targetBuffSourceMap.get(healEvent.targetID);

    const damageEvent = this.atonementSource;
    if (!damageEvent || !buffDetails) {
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
      buffDetails,
      expirationDelta: buffDetails.baseExpirationTimestamp - healEvent.timestamp,
    };

    this.eventEmitter.fabricateEvent(evt);
  }
}
