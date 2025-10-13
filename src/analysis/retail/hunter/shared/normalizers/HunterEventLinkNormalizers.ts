import { Options } from 'parser/core/Analyzer';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { EventType } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';

export const EXS_CAST_TO_DAMAGE = 'explosive_cast_to_damage';
export const SV_MB_CLEAVE = 'mb_cleave';
export const LFTF_TO_STAMPEDE_DAMAGE = 'lftf_to_stampede_damage';
export const LFTF_TO_STAMPEDE_BUFF_APPLY = 'lftf_to_stampede_buff_apply';
export const LFTF_TO_STAMPEDE_BUFF_REFRESH = 'lftf_to_stampede_buff_refresh';
const explosiveBuffer = 5500;
const stampedeDamageBuffer = 20_000;
const stampedeBuffer = 12_000;
const links: EventLink[] = [
  {
    linkRelation: EXS_CAST_TO_DAMAGE,
    linkingEventType: EventType.Cast,
    linkingEventId: TALENTS.EXPLOSIVE_SHOT_TALENT.id,
    referencedEventType: EventType.Damage,
    referencedEventId: SPELLS.EXPLOSIVE_SHOT_DAMAGE.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: explosiveBuffer,
    backwardBufferMs: 150,
    maximumLinks: 50,
  },
  {
    linkRelation: SV_MB_CLEAVE,
    linkingEventType: EventType.RemoveBuff,
    linkingEventId: SPELLS.HOGSTRIDER_BUFF.id,
    referencedEventType: EventType.Damage,
    referencedEventId: TALENTS.MONGOOSE_BITE_TALENT.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: 100,
    backwardBufferMs: 100,
    maximumLinks: 5,
  },
  {
    linkRelation: LFTF_TO_STAMPEDE_DAMAGE,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: SPELLS.LEAD_FROM_THE_FRONT.id,
    referencedEventType: EventType.Damage,
    referencedEventId: SPELLS.TWW_STAMPEDE_DAMAGE.id,
    anyTarget: true,
    anySource: false,
    forwardBufferMs: stampedeDamageBuffer,
    backwardBufferMs: 0,
    maximumLinks: 200,
  },
  {
    linkRelation: LFTF_TO_STAMPEDE_BUFF_APPLY,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: SPELLS.LEAD_FROM_THE_FRONT.id,
    referencedEventType: EventType.ApplyBuff,
    referencedEventId: SPELLS.TWW_STAMPEDE_BUFF.id,
    anyTarget: false,
    anySource: false,
    forwardBufferMs: stampedeBuffer,
    backwardBufferMs: 100,
    maximumLinks: 2,
  },
  {
    linkRelation: LFTF_TO_STAMPEDE_BUFF_REFRESH,
    linkingEventType: EventType.ApplyBuff,
    linkingEventId: SPELLS.LEAD_FROM_THE_FRONT.id,
    referencedEventType: EventType.RefreshBuff,
    referencedEventId: SPELLS.TWW_STAMPEDE_BUFF.id,
    anyTarget: false,
    anySource: false,
    forwardBufferMs: stampedeBuffer,
    backwardBufferMs: 100,
    maximumLinks: 2,
  },
];

export default class HunterEventLinkNormalizers extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, links);
  }
}
