import { HasSource, HasTarget, AnyEvent, EventType } from './Events';
import EventsNormalizer from './EventsNormalizer';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';

export default class FriendlyCompatNormalizer extends EventsNormalizer {
  priority = -1000;
  static dependencies = {
    ...EventsNormalizer.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  normalize(events: AnyEvent[]): AnyEvent[] {
    for (const event of events) {
      if (HasSource(event) && event.sourceIsFriendly === undefined) {
        event.sourceIsFriendly = this.isFriendly(event.sourceID, event.sourceInstance);
      }
      if (
        HasTarget(event) &&
        (event as unknown as Record<string, unknown>).targetIsFriendly === undefined
      ) {
        event.targetIsFriendly = this.isFriendly(event.targetID, event.targetInstance);
      }
      if (
        event.type === EventType.Absorbed &&
        event.attackerID &&
        event.attackerIsFriendly === undefined
      ) {
        event.attackerIsFriendly = this.isFriendly(event.attackerID);
      }
    }
    return events;
  }

  private isFriendly(actorId: number, instance?: number): boolean {
    const key = encodeTargetString(actorId, instance);
    return this.enemies.enemies[key] !== undefined;
  }
}
