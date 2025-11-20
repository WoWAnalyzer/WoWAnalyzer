import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import SPELLS from 'common/SPELLS/demonhunter';
import {
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvents,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import {
  SIGIL_OF_SPITE_SPELL_IDS,
  SIGIL_OF_CHAINS_SPELL_IDS,
  SIGIL_OF_FLAME_SPELL_IDS,
  SIGIL_OF_MISERY_SPELL_IDS,
  SIGIL_OF_SILENCE_SPELL_IDS,
} from 'analysis/retail/demonhunter/shared';

const SIGIL_EFFECT_BUFFER = 2500;

const CYCLE_OF_BINDING_SIGIL_OF_FLAME = 'CycleOfBindingSigilOfFlame';
const CYCLE_OF_BINDING_SIGIL_OF_MISERY = 'CycleOfBindingSigilOfMisery';
const CYCLE_OF_BINDING_ELYSIAN_DECREE = 'CycleOfBindingElysianDecree';
const CYCLE_OF_BINDING_SIGIL_OF_SILENCE = 'CycleOfBindingSigilOfSilence';
const CYCLE_OF_BINDING_SIGIL_OF_CHAINS = 'CycleOfBindingSigilOfChains';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: CYCLE_OF_BINDING_SIGIL_OF_FLAME,
    referencedEventId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    linkingEventId: SIGIL_OF_FLAME_SPELL_IDS,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SIGIL_EFFECT_BUFFER,
    backwardBufferMs: SIGIL_EFFECT_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: CYCLE_OF_BINDING_SIGIL_OF_MISERY,
    referencedEventId: SPELLS.SIGIL_OF_MISERY_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    linkingEventId: SIGIL_OF_MISERY_SPELL_IDS,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SIGIL_EFFECT_BUFFER,
    backwardBufferMs: SIGIL_EFFECT_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: CYCLE_OF_BINDING_ELYSIAN_DECREE,
    referencedEventId: SPELLS.SIGIL_OF_SPITE_DAMAGE.id,
    referencedEventType: EventType.ApplyDebuff,
    linkingEventId: SIGIL_OF_SPITE_SPELL_IDS,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SIGIL_EFFECT_BUFFER,
    backwardBufferMs: SIGIL_EFFECT_BUFFER,
    anyTarget: true,
  },

  {
    linkRelation: CYCLE_OF_BINDING_SIGIL_OF_SILENCE,
    referencedEventId: SPELLS.SIGIL_OF_SILENCE_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    linkingEventId: SIGIL_OF_SILENCE_SPELL_IDS,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SIGIL_EFFECT_BUFFER,
    backwardBufferMs: SIGIL_EFFECT_BUFFER,
    anyTarget: true,
  },
  {
    linkRelation: CYCLE_OF_BINDING_SIGIL_OF_CHAINS,
    referencedEventId: SPELLS.SIGIL_OF_CHAINS_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    linkingEventId: SIGIL_OF_CHAINS_SPELL_IDS,
    linkingEventType: EventType.Cast,
    forwardBufferMs: SIGIL_EFFECT_BUFFER,
    backwardBufferMs: SIGIL_EFFECT_BUFFER,
    anyTarget: true,
  },
];

export default class CycleOfBindingNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export const getTargetsAffectedBySigilOfFlame = (event: CastEvent) =>
  GetRelatedEvents<ApplyDebuffEvent>(event, CYCLE_OF_BINDING_SIGIL_OF_FLAME);

export const getTargetsAffectedBySigilOfMisery = (event: CastEvent) =>
  GetRelatedEvents<ApplyDebuffEvent>(event, CYCLE_OF_BINDING_SIGIL_OF_MISERY);

export const getTargetsAffectedByElysianDecree = (event: CastEvent) =>
  GetRelatedEvents<DamageEvent>(event, CYCLE_OF_BINDING_ELYSIAN_DECREE);

export const getTargetsAffectedBySigilOfSilence = (event: CastEvent) =>
  GetRelatedEvents<ApplyDebuffEvent>(event, CYCLE_OF_BINDING_SIGIL_OF_SILENCE);

export const getTargetsAffectedBySigilOfChains = (event: CastEvent) =>
  GetRelatedEvents<ApplyDebuffEvent>(event, CYCLE_OF_BINDING_SIGIL_OF_CHAINS);
