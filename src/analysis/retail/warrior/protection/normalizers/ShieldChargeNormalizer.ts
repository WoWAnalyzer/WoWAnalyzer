import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { AnyEvent, CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';

const SHIELD_CHARGE_DEDUPLICATION_WINDOW = 1500;

class ShieldChargeNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SHIELD_CHARGE_TALENT);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const normalizedEvents: AnyEvent[] = [];
    const realCastTimestamps = events
      .filter(
        (event): event is CastEvent =>
          event.type === EventType.Cast &&
          event.sourceID === this.selectedCombatant.id &&
          event.ability.guid === SPELLS.SHIELD_CHARGE.id,
      )
      .map((event) => event.timestamp);
    const fabricatedCastTimestamps: number[] = [];

    for (const event of events) {
      let fabricatedCast: CastEvent | undefined;

      if (!this.isShieldChargeDamage(event)) {
        normalizedEvents.push(event);
        continue;
      }

      if (this.hasNearbyTimestamp(realCastTimestamps, event.timestamp)) {
        normalizedEvents.push(event);
        continue;
      }

      if (this.hasNearbyTimestamp(fabricatedCastTimestamps, event.timestamp)) {
        normalizedEvents.push(event);
        continue;
      }

      // Shield Charge logs damage under 385954, while the playable talent is 385952
      // Cast events for 385954 are often missing, so use first impact damage as a stable fallback
      fabricatedCast = this.fabricateCast(event);
      fabricatedCastTimestamps.push(fabricatedCast.timestamp);
      normalizedEvents.push(fabricatedCast);
      normalizedEvents.push(event);
    }

    return normalizedEvents;
  }

  private isShieldChargeDamage(event: AnyEvent): event is DamageEvent {
    return (
      event.type === EventType.Damage &&
      event.sourceID === this.selectedCombatant.id &&
      event.ability.guid === SPELLS.SHIELD_CHARGE.id
    );
  }

  private hasNearbyTimestamp(timestamps: number[], timestamp: number): boolean {
    return timestamps.some(
      (existingTimestamp) =>
        Math.abs(existingTimestamp - timestamp) <= SHIELD_CHARGE_DEDUPLICATION_WINDOW,
    );
  }

  private fabricateCast(event: DamageEvent): CastEvent {
    return {
      timestamp: event.timestamp,
      type: EventType.Cast,
      ability: event.ability,
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: event.sourceIsFriendly,
      targetID: event.targetID,
      targetIsFriendly: event.targetIsFriendly,
      __fabricated: true,
    };
  }
}

export default ShieldChargeNormalizer;
