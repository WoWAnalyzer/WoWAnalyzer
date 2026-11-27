import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';

const GRAND_CRUSADER_WINDOW_MS = 25;
const SACRED_WEAPON_WINDOW_MS = 100;

export const GRAND_CRUSADER_HAMMERS = [
  TALENTS.BLESSED_HAMMER_TALENT,
  TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT,
];

export const GRAND_CRUSADER_AVOIDANCE_HIT_TYPES = [HIT_TYPES.DODGE, HIT_TYPES.PARRY];

export const GRAND_CRUSADER_FROM_HAMMER = 'GrandCrusaderFromHammer';
export const GRAND_CRUSADER_FROM_AVOIDANCE = 'GrandCrusaderFromAvoidance';
export const GRAND_CRUSADER_FROM_HOLY_BULWARK = 'GrandCrusaderFromHolyBulwark';
export const GRAND_CRUSADER_FROM_SACRED_WEAPON = 'GrandCrusaderFromSacredWeapon';

const GRAND_CRUSADER_PROC = {
  linkingEventId: SPELLS.GRAND_CRUSADER_BUFF.id,
  linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
  forwardBufferMs: GRAND_CRUSADER_WINDOW_MS,
  backwardBufferMs: GRAND_CRUSADER_WINDOW_MS,
};

const EVENT_LINKS: EventLink[] = [
  {
    ...GRAND_CRUSADER_PROC,
    linkRelation: GRAND_CRUSADER_FROM_HAMMER,
    referencedEventId: GRAND_CRUSADER_HAMMERS.map((spell) => spell.id),
    referencedEventType: EventType.Cast,
    anyTarget: true,
  },
  {
    ...GRAND_CRUSADER_PROC,
    linkRelation: GRAND_CRUSADER_FROM_AVOIDANCE,
    referencedEventId: null,
    referencedEventType: EventType.Damage,
    anySource: true,
    additionalCondition: (_, referencedEvent) =>
      referencedEvent.type === EventType.Damage &&
      GRAND_CRUSADER_AVOIDANCE_HIT_TYPES.includes(referencedEvent.hitType),
  },
  {
    ...GRAND_CRUSADER_PROC,
    linkRelation: GRAND_CRUSADER_FROM_HOLY_BULWARK,
    referencedEventId: SPELLS.HOLY_BULWARK_ABSORB.id,
    referencedEventType: EventType.Absorbed,
    anyTarget: true,
  },
  {
    ...GRAND_CRUSADER_PROC,
    linkRelation: GRAND_CRUSADER_FROM_SACRED_WEAPON,
    referencedEventId: [SPELLS.SACRED_WEAPON_DAMAGE.id, SPELLS.SACRED_WEAPON_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    forwardBufferMs: SACRED_WEAPON_WINDOW_MS,
    backwardBufferMs: 0,
    anyTarget: true,
  },
];

export default class GrandCrusaderLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GRAND_CRUSADER_TALENT);
  }
}
