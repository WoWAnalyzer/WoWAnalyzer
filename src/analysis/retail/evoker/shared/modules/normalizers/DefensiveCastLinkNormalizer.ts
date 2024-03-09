import { EventType } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';

export const OBSIDIAN_SCALES_CAST_BUFF_LINK = 'obsidianScalesCastBuffLink';
export const RENEWING_BLAZE_CAST_BUFF_LINK = 'renewingBlazeCastBuffLink';
export const RENEWING_BLAZE_ACC_HEAL_BUFF_LINK = 'renewingBlazeAccHealBuffLink';
export const RENEWING_BLAZE_HEAL_BUFF_LINK = 'renewingBlazeHealBuffLink';
export const TWIN_GUARDIAN_PARTNER_BUFF_LINK = 'twinGuardianPartnerBuffLink';

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: OBSIDIAN_SCALES_CAST_BUFF_LINK,
    reverseLinkRelation: OBSIDIAN_SCALES_CAST_BUFF_LINK,
    linkingEventId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS.OBSIDIAN_SCALES_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: 10,
    backwardBufferMs: 10,
  },
  {
    linkRelation: RENEWING_BLAZE_CAST_BUFF_LINK,
    reverseLinkRelation: RENEWING_BLAZE_CAST_BUFF_LINK,
    linkingEventId: TALENTS.RENEWING_BLAZE_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: TALENTS.RENEWING_BLAZE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: 10,
    backwardBufferMs: 10,
  },
  {
    linkRelation: RENEWING_BLAZE_ACC_HEAL_BUFF_LINK,
    reverseLinkRelation: RENEWING_BLAZE_ACC_HEAL_BUFF_LINK,
    linkingEventId: TALENTS.RENEWING_BLAZE_TALENT.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.RENEWING_BLAZE_HEAL.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: 5000,
    maximumLinks: 1,
  },
  {
    linkRelation: RENEWING_BLAZE_HEAL_BUFF_LINK,
    reverseLinkRelation: RENEWING_BLAZE_HEAL_BUFF_LINK,
    linkingEventId: SPELLS.RENEWING_BLAZE_HEAL.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.RENEWING_BLAZE_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    forwardBufferMs: 30000,
  },
  {
    linkRelation: TWIN_GUARDIAN_PARTNER_BUFF_LINK,
    reverseLinkRelation: TWIN_GUARDIAN_PARTNER_BUFF_LINK,
    linkingEventId: SPELLS.TWIN_GUARDIAN_SHIELD.id,
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.TWIN_GUARDIAN_SHIELD.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: 1000,
  },
];

class DefensiveCastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default DefensiveCastLinkNormalizer;
