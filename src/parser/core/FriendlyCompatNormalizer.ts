import { HasSource, HasTarget, AnyEvent, EventType } from './Events';
import EventsNormalizer from './EventsNormalizer';
import Enemies from 'parser/shared/modules/Enemies';

export default class FriendlyCompatNormalizer extends EventsNormalizer {
  priority = -1000;
  static dependencies = {
    ...EventsNormalizer.dependencies,
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  normalize(events: AnyEvent[]): AnyEvent[] {
    for (const event of events) {
      if (HasSource(event) && event.sourceID > 0 && event.sourceIsFriendly === undefined) {
        event.sourceIsFriendly = !this.enemies.isEnemy(event.sourceID, event.sourceInstance);
      }
      if (
        HasTarget(event) &&
        event.targetID > 0 &&
        (event as unknown as Record<string, unknown>).targetIsFriendly === undefined
      ) {
        event.targetIsFriendly = !this.enemies.isEnemy(event.targetID, event.targetInstance);
      }
      if (
        event.type === EventType.Absorbed &&
        (event.attackerID ?? 0) > 0 &&
        event.attackerIsFriendly === undefined
      ) {
        event.attackerIsFriendly = !this.enemies.isEnemy(event.attackerID, event.attackerInstance);
      }
    }
    return events;
  }
}
