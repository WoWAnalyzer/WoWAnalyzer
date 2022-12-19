import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { ApplyBuffEvent, EventType, GetRelatedEvents, RemoveBuffEvent } from 'parser/core/Events';
import { MAJOR_DEFENSIVES } from './DefensiveBuffs';
import { isTalent } from 'common/TALENTS/types';
import { buffId } from 'interface/guide/components/MajorDefensives';

const relation = 'defensive-buff-remove';
const reverseRelation = 'defensive-buff-apply';
const links = MAJOR_DEFENSIVES.filter(({ isBuff }) => isBuff).map(
  ({ triggerSpell, appliedSpell, isBuff, bufferMs }): EventLink => ({
    linkRelation: relation,
    reverseLinkRelation: reverseRelation,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: buffId({ triggerSpell, appliedSpell, isBuff }),
    referencedEventType: EventType.RemoveBuff,
    referencedEventId: buffId({ triggerSpell, appliedSpell, isBuff }),
    anySource: false,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: bufferMs ?? 20000,
    isActive: (combatant) =>
      !isTalent(triggerSpell) || (isTalent(triggerSpell) && combatant.hasTalent(triggerSpell)),
  }),
);

export default class DefensiveBuffLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
    console.log('links=', links);
  }
}

export function defensiveApplication(event: RemoveBuffEvent): ApplyBuffEvent | undefined {
  return GetRelatedEvents(event, reverseRelation)[0] as ApplyBuffEvent | undefined;
}

export function defensiveExpiration(event: ApplyBuffEvent): RemoveBuffEvent | undefined {
  return GetRelatedEvents(event, relation)[0] as RemoveBuffEvent | undefined;
}
