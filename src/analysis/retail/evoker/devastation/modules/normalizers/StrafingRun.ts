import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import {
  CastEvent,
  EventType,
  GetRelatedEvent,
  HasRelatedEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { STRAFING_RUN_DURATION } from '../../constants';
import { DEEP_BREATH_SPELL_IDS } from 'analysis/retail/evoker/shared';

const STRAFING_RUN_PRIMARY = 'StrafingPrimary';
const STRAFING_RUN_SECONDARY = 'StrafingSecondary';
const STRAFING_RUN_BUFFER_MS = STRAFING_RUN_DURATION * 1.1;

const STRAFING_RUN_BUFF_CONSUME = 'StrafingRunBuffConsume';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: STRAFING_RUN_SECONDARY,
    reverseLinkRelation: STRAFING_RUN_PRIMARY,
    linkingEventId: DEEP_BREATH_SPELL_IDS,
    linkingEventType: EventType.Cast,
    referencedEventId: DEEP_BREATH_SPELL_IDS,
    referencedEventType: EventType.Cast,
    forwardBufferMs: STRAFING_RUN_BUFFER_MS,
    maximumLinks: 1,
    additionalCondition: (linkingEvent, referencedEvent) =>
      linkingEvent.timestamp !== referencedEvent.timestamp && // It will try to link to itself
      !HasRelatedEvent(linkingEvent, STRAFING_RUN_PRIMARY) &&
      !HasRelatedEvent(referencedEvent, STRAFING_RUN_SECONDARY),
  },
  {
    linkRelation: STRAFING_RUN_BUFF_CONSUME,
    reverseLinkRelation: STRAFING_RUN_BUFF_CONSUME,
    linkingEventId: SPELLS.STRAFING_RUN_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: DEEP_BREATH_SPELL_IDS,
    referencedEventType: EventType.Cast,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    anyTarget: true,
    maximumLinks: 1,
  },
];

export default class StrafingRunNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.STRAFING_RUN_TALENT);
  }
}

export function getSecondaryDeepBreathEvent(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvent<CastEvent>(event, STRAFING_RUN_SECONDARY);
}

export function getPrimaryDeepBreathEvent(event: CastEvent): CastEvent | undefined {
  return GetRelatedEvent<CastEvent>(event, STRAFING_RUN_PRIMARY);
}

export function isFromStrafingRunConsume(event: CastEvent | RemoveBuffEvent) {
  return HasRelatedEvent(event, STRAFING_RUN_BUFF_CONSUME);
}
