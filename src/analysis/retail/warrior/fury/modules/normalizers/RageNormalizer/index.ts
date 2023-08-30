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
    return [
      scaleRageGainEvents,
      generateRageEvents.bind(this),
      attributeRageBonuses.bind(this),
    ].reduce((e, fn) => fn(e), events);
  }
}

export default RageNormalizer;
