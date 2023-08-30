import WindfuryLinkNormalizer from 'analysis/retail/warrior/shared/modules/normalizers/WindfuryLinkNormalizer';
import { AnyEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import attributeRageBonuses from './attributeRageBonuses';
import generateRageEvents from './generateRageEvents';
import scaleRageGainEvents from './scaleRageGainEvents';

class RageNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    windfuryLinkNormalizer: WindfuryLinkNormalizer,
  };

  normalize(events: AnyEvent[]): AnyEvent[] {
    events = scaleRageGainEvents(events);
    events = generateRageEvents(this.selectedCombatant, events);
    events = attributeRageBonuses(this.selectedCombatant, events);
    return events;
  }
}

export default RageNormalizer;
