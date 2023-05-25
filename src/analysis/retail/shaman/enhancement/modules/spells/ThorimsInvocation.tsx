import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';

const WINDSTRIKE_AFTER_FREE_LIGHTNING_BOLT = 'WindstrikeAfterLightningBolt';
const WINDSTRIKE_AFTER_FREE_CHAIN_LIGHTNING = 'WindstrikeAfterChainLightning';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: WINDSTRIKE_AFTER_FREE_LIGHTNING_BOLT,
    referencedEventId: SPELLS.LIGHTNING_BOLT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.WINDSTRIKE_CAST.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: 0,
    anyTarget: true,
    isActive: (combatant) => combatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id),
  },
  {
    linkRelation: WINDSTRIKE_AFTER_FREE_CHAIN_LIGHTNING,
    referencedEventId: TALENTS.CHAIN_LIGHTNING_TALENT.id,
    referencedEventType: EventType.Cast,
    linkingEventId: SPELLS.WINDSTRIKE_CAST.id,
    linkingEventType: EventType.Cast,
    forwardBufferMs: 0,
    backwardBufferMs: 0,
    anyTarget: true,
    isActive: (combatant) => combatant.hasBuff(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id),
  },
];

export default class ThorimsInvocationNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getThorimsInvocationProc(event: CastEvent): CastEvent | undefined {
  const relatedEvents = [
    ...GetRelatedEvents(event, WINDSTRIKE_AFTER_FREE_LIGHTNING_BOLT),
    ...GetRelatedEvents(event, WINDSTRIKE_AFTER_FREE_CHAIN_LIGHTNING),
  ];

  return relatedEvents.filter((e): e is CastEvent => e.type === EventType.Cast).find(Boolean);
}
