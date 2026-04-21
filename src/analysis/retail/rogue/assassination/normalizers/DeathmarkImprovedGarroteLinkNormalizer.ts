import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/rogue';
import SPELLS from 'common/SPELLS/rogue';
import {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  RemoveBuffEvent,
} from 'parser/core/Events';

const DEATHMARK_IMPROVED_GARROTE_REMOVE = 'DeathmarkImprovedGarroteRemove';
const DEATHMARK_IMPROVED_GARROTE_APPLY = 'DeathmarkImprovedGarroteApply';

const EVENT_LINKS: EventLink[] = [
  {
    linkingEventType: EventType.Cast,
    linkingEventId: TALENTS.DEATHMARK_TALENT.id,
    linkRelation: DEATHMARK_IMPROVED_GARROTE_REMOVE,
    reverseLinkRelation: DEATHMARK_IMPROVED_GARROTE_REMOVE,
    referencedEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.IMPROVED_GARROTE_BUFF.id,
    backwardBufferMs: 8000,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.DEATHMARK_TALENT),
  },
  {
    linkingEventType: EventType.Cast,
    linkingEventId: TALENTS.DEATHMARK_TALENT.id,
    linkRelation: DEATHMARK_IMPROVED_GARROTE_APPLY,
    reverseLinkRelation: DEATHMARK_IMPROVED_GARROTE_APPLY,
    referencedEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.IMPROVED_GARROTE_BUFF.id,
    forwardBufferMs: 4000,
    backwardBufferMs: 8000,
    anyTarget: true,
    isActive: (c) => c.hasTalent(TALENTS.DEATHMARK_TALENT),
  },
];

export default class DeathmarkImprovedGarroteLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATHMARK_TALENT);
  }
}

export const getMatchingImprovedGarroteRemove = (event: CastEvent) =>
  GetRelatedEvents(event, DEATHMARK_IMPROVED_GARROTE_REMOVE)
    .filter((e): e is RemoveBuffEvent => e.type === EventType.RemoveBuff)
    .at(0);

export const getMatchingImprovedGarroteApply = (event: CastEvent) =>
  GetRelatedEvents(event, DEATHMARK_IMPROVED_GARROTE_APPLY)
    .filter((e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff)
    .at(0);
