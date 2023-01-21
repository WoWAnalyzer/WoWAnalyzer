import { isTalent } from 'common/TALENTS/types';
import { buffId } from 'interface/guide/components/MajorDefensives';
import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, EventType, GetRelatedEvents, RemoveBuffEvent } from 'parser/core/Events';
import { MAJOR_DEFENSIVES } from './DefensiveBuffs';

const relation = 'defensive-buff-remove';
const reverseRelation = 'defensive-buff-apply';
const links = MAJOR_DEFENSIVES.map(
  (defensive): EventLink => ({
    linkRelation: relation,
    reverseLinkRelation: reverseRelation,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: buffId(defensive),
    referencedEventType: EventType.RemoveBuff,
    referencedEventId: buffId(defensive),
    anySource: false,
    anyTarget: false,
    maximumLinks: 1,
    forwardBufferMs: 20000,
    isActive: (combatant) =>
      !isTalent(defensive.triggerSpell) || combatant.hasTalent(defensive.triggerSpell),
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
