import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/rogue';
import { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';

export const SHIV_KINGSBANE_BUFFER_MS = 2000;
const SHIV_KINGSBANE = 'ShivKingsbane';

const DEATHMARK_KINGSBANE_APPLY_BUFFER_MS = 2000;
const DEATHMARK_KINGSBANE_APPLY = 'DeathmarkKingsbaneApply';

const DEATHMARK_KINGSBANE_REMOVE_BUFFER_MS = 2000;
const DEATHMARK_KINGSBANE_REMOVE = 'DeathmarkKingsbaneRemove';

const DEATHMARK_KINGSBANE_CAST_BUFFER_MS = 2000;
const DEATHMARK_KINGSBANE_CAST = 'DeathmarkKingsbaneCast';

const EVENT_LINKS: EventLink[] = [
  // Link a Shiv and Kingsbane cast
  {
    linkingEventType: EventType.Cast,
    linkingEventId: SPELLS.SHIV.id,
    linkRelation: SHIV_KINGSBANE,
    reverseLinkRelation: SHIV_KINGSBANE,
    referencedEventType: EventType.Cast,
    referencedEventId: TALENTS.KINGSBANE_TALENT.id,
    forwardBufferMs: SHIV_KINGSBANE_BUFFER_MS,
    backwardBufferMs: SHIV_KINGSBANE_BUFFER_MS,
    anyTarget: true,
    maximumLinks: (c) => 1 + c.getTalentRank(TALENTS.LIGHTWEIGHT_SHIV_TALENT),
  },

  // Link Deathmark and Kingsbane
  {
    linkingEventType: EventType.Cast,
    linkingEventId: TALENTS.DEATHMARK_TALENT.id,
    linkRelation: DEATHMARK_KINGSBANE_CAST,
    reverseLinkRelation: DEATHMARK_KINGSBANE_CAST,
    referencedEventType: EventType.Cast,
    referencedEventId: TALENTS.KINGSBANE_TALENT.id,
    forwardBufferMs: DEATHMARK_KINGSBANE_CAST_BUFFER_MS,
    backwardBufferMs: DEATHMARK_KINGSBANE_CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.DEATHMARK_TALENT),
  },
  {
    linkingEventType: EventType.ApplyDebuff,
    linkingEventId: TALENTS.DEATHMARK_TALENT.id,
    linkRelation: DEATHMARK_KINGSBANE_APPLY,
    reverseLinkRelation: DEATHMARK_KINGSBANE_APPLY,
    referencedEventType: EventType.ApplyDebuff,
    referencedEventId: TALENTS.KINGSBANE_TALENT.id,
    forwardBufferMs: DEATHMARK_KINGSBANE_APPLY_BUFFER_MS,
    backwardBufferMs: DEATHMARK_KINGSBANE_APPLY_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.DEATHMARK_TALENT),
  },
  {
    linkingEventType: EventType.RemoveDebuff,
    linkingEventId: TALENTS.DEATHMARK_TALENT.id,
    linkRelation: DEATHMARK_KINGSBANE_REMOVE,
    reverseLinkRelation: DEATHMARK_KINGSBANE_REMOVE,
    referencedEventType: EventType.RemoveDebuff,
    referencedEventId: TALENTS.KINGSBANE_TALENT.id,
    forwardBufferMs: DEATHMARK_KINGSBANE_REMOVE_BUFFER_MS,
    backwardBufferMs: DEATHMARK_KINGSBANE_REMOVE_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive: (c) => c.hasTalent(TALENTS.DEATHMARK_TALENT),
  },
];

export default class KingsbaneLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.KINGSBANE_TALENT);
  }
}

export const getMatchingShivOrKingsbaneCast = (event: CastEvent) =>
  GetRelatedEvents(event, SHIV_KINGSBANE)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .at(0);

export const getMatchingDeathmarkOrKingsbaneCast = (event: CastEvent) =>
  GetRelatedEvents(event, DEATHMARK_KINGSBANE_CAST)
    .filter((e): e is CastEvent => e.type === EventType.Cast)
    .at(0);
