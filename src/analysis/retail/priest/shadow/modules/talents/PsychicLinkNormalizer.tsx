import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType, GetRelatedEvents, DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

const DAMAGE_TARGET = 'DamagesTarget';

const BUFFER_MS_BACK = 100;
const BUFFER_MS_FORWARD = 0;

const LinkingSpells = [
  //these are al the spells that cause Psychich Link Damage
  SPELLS.MIND_BLAST.id,

  TALENTS.SHADOW_WORD_DEATH_TALENT.id,
  TALENTS.MINDGAMES_TALENT.id,

  TALENTS.DEVOURING_PLAGUE_TALENT.id, //initial hit only
  TALENTS.MIND_SPIKE_TALENT.id,
  SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE.id,
  TALENTS.VOID_TORRENT_TALENT.id,
  SPELLS.VOID_BOLT.id,
];

/*
  This file is for linking the damage of Psychic Link to the spell damage that caused them
  */
const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: DAMAGE_TARGET,
    linkingEventId: SPELLS.PSYCHIC_LINK_TALENT_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: LinkingSpells,
    referencedEventType: EventType.Damage,
    forwardBufferMs: BUFFER_MS_BACK,
    backwardBufferMs: BUFFER_MS_FORWARD,
    anyTarget: true,
    additionalCondition: (referencedEvent) =>
      referencedEvent.type === EventType.Damage && !referencedEvent.tick,
    isActive(c) {
      return c.hasTalent(TALENTS.PSYCHIC_LINK_TALENT);
    },
    maximumLinks: 1,
  },
];

export default class PsychicLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getDamage(event: DamageEvent): DamageEvent[] {
  console.log('getdamage');
  return GetRelatedEvents<DamageEvent>(event, DAMAGE_TARGET);
}
