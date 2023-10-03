import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import {
  ApplyDebuffEvent,
  BuffEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';

const BOOSTED_BLEED = 'BoostedBleed';
const BOOSTED_DAMAGE = 'BoostedDamage';
const BOOSTED_BY_SA = 'BoostedBySuddenAmbush';

const CAST_BUFFER_MS = 50;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: BOOSTED_BLEED,
    reverseLinkRelation: BOOSTED_BY_SA,
    linkingEventId: SPELLS.SUDDEN_AMBUSH_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.RAKE_BLEED.id,
    referencedEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
  {
    linkRelation: BOOSTED_DAMAGE,
    linkingEventId: SPELLS.SUDDEN_AMBUSH_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [SPELLS.RAKE.id, SPELLS.SHRED.id],
    referencedEventType: EventType.Damage,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
  },
];

/**
 * This normalizer links each Sudden Ambush buff consume to the damage / debuffs it boosted
 */
class SuddenAmbushLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default SuddenAmbushLinkNormalizer;

export function getSuddenAmbushBoostedBleeds(event: RemoveBuffEvent): BuffEvent<any>[] {
  return GetRelatedEvents(
    event,
    BOOSTED_BLEED,
    (e): e is BuffEvent<any> =>
      e.type === EventType.ApplyDebuff || e.type === EventType.RefreshDebuff,
  );
}

export function getSuddenAmbushBoostedDamage(event: RemoveBuffEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    BOOSTED_DAMAGE,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function isBoostedBySuddenAmbush(event: ApplyDebuffEvent | RefreshDebuffEvent) {
  return HasRelatedEvent(event, BOOSTED_BY_SA);
}
