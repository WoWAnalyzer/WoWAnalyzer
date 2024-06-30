import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import talents from 'common/TALENTS/monk';
import { DamageEvent, EventType, HasRelatedEvent, HealEvent } from 'parser/core/Events';
import { CAST_BUFFER_MS } from 'analysis/retail/monk/mistweaver/normalizers/EventLinks/EventLinkConstants';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';

export const RESTORE_BALANCE_APPLY = 'restoreBalanceApply';
export const RESTORE_BALANCE = 'restoreBalance';

const RJW_MAX_DURATION = 25000;

const CELESTIAL_CONDUIT_EVENT_LINKS: EventLink[] = [
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
      return c.hasTalent(talents.RESTORE_BALANCE_TALENT);
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
      return c.hasTalent(talents.RESTORE_BALANCE_TALENT);
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
      return c.hasTalent(talents.RESTORE_BALANCE_TALENT);
    },
    //
    // additionalCondition(referencedEvent) {
    //     return !HasRelatedEvent(referencedEvent, RJW_TFT);
    // },
  },
];

class ConduitOfTheCelestialsEventLinks extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, CELESTIAL_CONDUIT_EVENT_LINKS);
  }
}

export function isFromRestoreBalance(event: HealEvent | DamageEvent): boolean {
  return HasRelatedEvent(event, RESTORE_BALANCE);
}

export default ConduitOfTheCelestialsEventLinks;
