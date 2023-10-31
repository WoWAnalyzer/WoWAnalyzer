import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, EventType, GetRelatedEvents, RemoveBuffEvent } from 'parser/core/Events';
import { buffId, MAJOR_DEFENSIVES } from './Defensivebuffs';
import { isTalent } from 'common/TALENTS/types';

const relation = 'defensive-buff-remove';
const reverseRelation = 'defensive-buff-apply';
const links = MAJOR_DEFENSIVES.filter(([, , isBuff]) => isBuff).map(
  ([talent, buff, isBuff]): EventLink => ({
    linkRelation: relation,
    reverseLinkRelation: reverseRelation,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: buffId([talent, buff, isBuff]),
    referencedEventType: EventType.RemoveBuff,
    referencedEventId: buffId([talent, buff, isBuff]),
    anySource: false,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: 20000,
    isActive: (combatant) => !isTalent(talent) || (isTalent(talent) && combatant.hasTalent(talent)),
  }),
);

export default class DefensiveBuffLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}

export function defensiveApplication(event: RemoveBuffEvent): ApplyBuffEvent | undefined {
  return GetRelatedEvents(event, reverseRelation)[0] as ApplyBuffEvent | undefined;
}

export function defensiveExpiration(event: ApplyBuffEvent): RemoveBuffEvent | undefined {
  return GetRelatedEvents(event, relation)[0] as RemoveBuffEvent | undefined;
}
