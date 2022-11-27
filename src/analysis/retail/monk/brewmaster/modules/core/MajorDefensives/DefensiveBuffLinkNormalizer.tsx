import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, EventType, RemoveBuffEvent } from 'parser/core/Events';
import { buffId, MAJOR_DEFENSIVES } from './DefensiveBuffs';

const relation = 'defensive-buff-removet';
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
  return event._linkedEvents?.find((rel) => rel.relation === reverseRelation)
    ?.event as ApplyBuffEvent;
}

export function defensiveExpiration(event: ApplyBuffEvent): RemoveBuffEvent | undefined {
  return event._linkedEvents?.find((rel) => rel.relation === relation)?.event as RemoveBuffEvent;
}
