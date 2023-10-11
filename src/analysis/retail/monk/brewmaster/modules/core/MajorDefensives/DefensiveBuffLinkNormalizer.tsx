import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, EventType, GetRelatedEvent, RemoveBuffEvent } from 'parser/core/Events';
import { buffId, MAJOR_DEFENSIVES } from './DefensiveBuffs';

const relation = 'defensive-buff-remove';
const reverseRelation = 'defensive-buff-apply';
const links = MAJOR_DEFENSIVES.map(
  ([talent, buff]): EventLink => ({
    linkRelation: relation,
    reverseLinkRelation: reverseRelation,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: buffId([talent, buff]),
    referencedEventType: EventType.RemoveBuff,
    referencedEventId: buffId([talent, buff]),
    anySource: false,
    anyTarget: false,
    maximumLinks: 1,
    forwardBufferMs: 20000,
    isActive: (combatant) => combatant.hasTalent(talent),
  }),
);

export default class DefensiveBuffLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}

export function defensiveApplication(event: RemoveBuffEvent): ApplyBuffEvent | undefined {
  return GetRelatedEvent(event, reverseRelation);
}

export function defensiveExpiration(event: ApplyBuffEvent): RemoveBuffEvent | undefined {
  return GetRelatedEvent(event, relation);
}
