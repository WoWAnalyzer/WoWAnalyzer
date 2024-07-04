import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { DamageEvent, EventType, HasRelatedEvent, HealEvent } from 'parser/core/Events';
import { CAST_BUFFER_MS } from 'analysis/retail/monk/mistweaver/normalizers/EventLinks/EventLinkConstants';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import SPECS from 'game/SPECS';

export const CELESTIAL_CONDUIT_ = 'CelestialConduit';
export const RESTORE_BALANCE_APPLY = 'restoreBalanceApply';
export const RESTORE_BALANCE = 'restoreBalance';
export const UNITY_FOTRC = 'UnityFlightOfTheRedCrane';
export const UNITY_COTWT = 'UnityCourageOfTheWhiteTiger';
export const UNITY_SOTBO = 'UnityStrengthOfTheBlackOx';

const RJW_MAX_DURATION = 25000;
export const CELESTIAL_CONDUIT_MAX_DURATION = 4000;

const CELESTIAL_CONDUIT_LINK: EventLink = {
  linkRelation: CELESTIAL_CONDUIT_,
  reverseLinkRelation: CELESTIAL_CONDUIT_,
  linkingEventId: [SPELLS.CELESTIAL_CONDUIT_HEAL.id, SPELLS.CELESTIAL_CONDUIT_DAMAGE.id],
  linkingEventType: [EventType.Heal, EventType.Damage],
  referencedEventId: [talents.CELESTIAL_CONDUIT_TALENT.id],
  referencedEventType: EventType.Cast,
  anyTarget: true,
  forwardBufferMs: CAST_BUFFER_MS,
  backwardBufferMs: CELESTIAL_CONDUIT_MAX_DURATION,
  isActive(c) {
    return c.hasTalent(talents.CELESTIAL_CONDUIT_TALENT);
  },
};

const RESTORE_BALANCE_EVENT_LINKS: EventLink[] = [
  //windwalker
  {
    linkRelation: RESTORE_BALANCE_APPLY,
    reverseLinkRelation: RESTORE_BALANCE_APPLY,
    linkingEventId: talents.RUSHING_JADE_WIND_WINDWALKER_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: talents.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id,
    referencedEventType: EventType.Cast,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(talents.RESTORE_BALANCE_TALENT) && c.specId === SPECS.WINDWALKER_MONK.id;
    },
  },
  //mistweaver
  {
    linkRelation: RESTORE_BALANCE_APPLY,
    reverseLinkRelation: RESTORE_BALANCE_APPLY,
    linkingEventId: SPELLS.REFRESHING_JADE_WIND_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [
      talents.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
      talents.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(talents.RESTORE_BALANCE_TALENT) && c.specId === SPECS.MISTWEAVER_MONK.id;
    },
  },
  {
    linkRelation: RESTORE_BALANCE,
    reverseLinkRelation: RESTORE_BALANCE,
    linkingEventId: SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [
      talents.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
      talents.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: RJW_MAX_DURATION,
    isActive(c) {
      return c.hasTalent(talents.RESTORE_BALANCE_TALENT) && c.specId === SPECS.MISTWEAVER_MONK.id;
    },
  },
];

const UNITY_WITHIN_EVENT_LINKS: EventLink[] = [
  //flight of the red crane unity
  {
    linkRelation: UNITY_FOTRC,
    reverseLinkRelation: UNITY_FOTRC,
    linkingEventId: SPELLS.FLIGHT_OF_THE_RED_CRANE_UNITY.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [SPELLS.UNITY_WITHIN_CAST.id, TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id],
    referencedEventType: [EventType.Cast, EventType.EndChannel],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(talents.UNITY_WITHIN_TALENT) && c.specId === SPECS.MISTWEAVER_MONK.id;
    },
  },
  //courage of the white tiger unity
];

class ConduitOfTheCelestialsEventLinks extends EventLinkNormalizer {
  constructor(options: Options) {
    const EVENT_LINKS: EventLink[] = [
      CELESTIAL_CONDUIT_LINK,
      ...UNITY_WITHIN_EVENT_LINKS,
      ...RESTORE_BALANCE_EVENT_LINKS,
    ];

    super(options, EVENT_LINKS);
  }
}

export function isFromRestoreBalance(event: HealEvent | DamageEvent): boolean {
  return HasRelatedEvent(event, RESTORE_BALANCE);
}

export default ConduitOfTheCelestialsEventLinks;
