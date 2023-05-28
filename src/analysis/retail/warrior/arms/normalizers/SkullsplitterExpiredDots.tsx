import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';

const deepWoundsRelation = 'skullsplitter_deepWounds_tick';
const rendRelation = 'skullsplitter_rend_tick';
const buffer = 400;

const DEEPWOUNDS_TICK_LINK: EventLink = {
  linkRelation: deepWoundsRelation,
  linkingEventId: TALENTS.SKULLSPLITTER_TALENT.id,
  linkingEventType: EventType.Damage,
  forwardBufferMs: buffer,

  referencedEventId: SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id,
  referencedEventType: EventType.Damage,
};
const REND_TICK_LINK: EventLink = {
  linkRelation: rendRelation,
  linkingEventId: TALENTS.SKULLSPLITTER_TALENT.id,
  linkingEventType: EventType.Damage,
  forwardBufferMs: buffer,

  referencedEventId: SPELLS.REND_DOT_ARMS.id,
  referencedEventType: EventType.Damage,
};

class SkullsplitterDotNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [DEEPWOUNDS_TICK_LINK, REND_TICK_LINK]);
  }
}

export default SkullsplitterDotNormalizer;

function eventsByRelation(event: DamageEvent, relation: string): DamageEvent[] {
  const filteredEvents = event._linkedEvents?.filter((rel) => rel.relation === relation);
  if (filteredEvents === undefined) {
    return new Array<DamageEvent>();
  }
  const damageEvents: DamageEvent[] = new Array<DamageEvent>(filteredEvents!.length);
  for (let i = 0; i < damageEvents.length; i += 1) {
    damageEvents[i] = filteredEvents![i].event as DamageEvent;
  }
  return damageEvents;
}

export function rendDamageEvents(event: DamageEvent): DamageEvent[] {
  return eventsByRelation(event, rendRelation);
}

export function deepWoundsDamageEvents(event: DamageEvent): DamageEvent[] {
  return eventsByRelation(event, deepWoundsRelation);
}
