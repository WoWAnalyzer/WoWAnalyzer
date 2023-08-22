import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  RefreshBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';

/** So sometimes when Ebon Might should be extended
 * it just kinda doesn't? This messes with our analysis so
 * let's check if it failed to extend where it should
 * See example of this here (upheavel should have extended but didnt):
 * https://www.warcraftlogs.com/reports/1JqKrX2vLxb6Zyp9/#fight=8&source=3&pins=2%24Off%24%23244F4B%24expression%24type%20%3D%20%22empowerend%22%20or%20type%3D%22removebuff%22&view=events&start=1402475&end=1408776
 */
export const FAILED_EXTENSION_LINK = 'failedExtensionLink';

export const PRESCIENCE_BUFF_CAST_LINK = 'prescienceBuffCastLink';
export const PRESCIENCE_APPLY_REMOVE_LINK = 'prescienceApplyRemoveLink';
export const TIP_THE_SCALES_CONSUME = 'tipTheScalesConsume';
export const BREATH_EBON_APPLY_LINK = 'breathEbonApplyLink';
export const EBON_MIGHT_BUFF_LINKS = 'ebonMightBuffLinks';
export const EBON_MIGHT_APPLY_REMOVE_LINK = 'ebonMightApplyRemoveLink';

export const ESSENCE_BURST_GENERATED = 'EssenceBurstGenerated';

export const BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK = 'breathOfEonsCastDebuffApplyLink';
export const BREATH_OF_EONS_CAST_BUFF_LINK = 'breathOfEonsCastBuffLink';
export const BREATH_OF_EONS_DAMAGE_LINK = 'breathOfEonsDamageLink';

export const ERUPTION_CAST_DAM_LINK = 'eruptionCastDamLink';
export const ERUPTION_CHITIN_LINK = 'eruptionChitinLink';
export const PUPIL_OF_ALEXSTRASZA_LINK = 'pupilOfAlexstraszaLink';

export const PRESCIENCE_BUFFER = 150;
export const CAST_BUFFER_MS = 100;
export const BREATH_EBON_BUFFER = 250;
export const EBON_MIGHT_BUFFER = 150;
export const BREATH_OF_EONS_DEBUFF_APPLY_BUFFER = 8000;
export const BREATH_OF_EONS_BUFF_BUFFER = 8000;
export const BREATH_OF_EONS_DAMAGE_BUFFER = 100;
export const PUPIL_OF_ALEXSTRASZA_BUFFER = 1000;

const EVENT_LINKS: EventLink[] = [
  {
    linkRelation: PRESCIENCE_BUFF_CAST_LINK,
    reverseLinkRelation: PRESCIENCE_BUFF_CAST_LINK,
    linkingEventId: SPELLS.PRESCIENCE_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS.PRESCIENCE_TALENT.id,
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: PRESCIENCE_BUFFER,
    backwardBufferMs: PRESCIENCE_BUFFER,
  },
  {
    linkRelation: PRESCIENCE_APPLY_REMOVE_LINK,
    linkingEventId: SPELLS.PRESCIENCE_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RemoveBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.PRESCIENCE_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RemoveBuff, EventType.RefreshBuff],
    anyTarget: true,
    forwardBufferMs: 5000,
    backwardBufferMs: 5000,
  },
  {
    linkRelation: TIP_THE_SCALES_CONSUME,
    reverseLinkRelation: TIP_THE_SCALES_CONSUME,
    linkingEventId: TALENTS.TIP_THE_SCALES_TALENT.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.FIRE_BREATH.id,
      SPELLS.FIRE_BREATH_FONT.id,
      SPELLS.UPHEAVAL.id,
      SPELLS.UPHEAVAL_FONT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: BREATH_EBON_APPLY_LINK,
    reverseLinkRelation: BREATH_EBON_APPLY_LINK,
    linkingEventId: TALENTS.BREATH_OF_EONS_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: BREATH_EBON_BUFFER,
  },
  {
    linkRelation: EBON_MIGHT_BUFF_LINKS,
    reverseLinkRelation: EBON_MIGHT_BUFF_LINKS,
    linkingEventId: SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    anyTarget: true,
    forwardBufferMs: EBON_MIGHT_BUFFER,
    backwardBufferMs: EBON_MIGHT_BUFFER,
  },
  {
    linkRelation: EBON_MIGHT_APPLY_REMOVE_LINK,
    reverseLinkRelation: EBON_MIGHT_APPLY_REMOVE_LINK,
    linkingEventId: [SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id],
    linkingEventType: [EventType.ApplyBuff],
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
    referencedEventType: [EventType.RemoveBuff],
    anyTarget: true,
  },
  {
    linkRelation: BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK,
    reverseLinkRelation: BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK,
    linkingEventId: TALENTS.BREATH_OF_EONS_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
    referencedEventType: EventType.ApplyDebuff,
    anyTarget: true,
    forwardBufferMs: BREATH_OF_EONS_DEBUFF_APPLY_BUFFER,
  },
  // Used to help determine time spend flying
  {
    linkRelation: BREATH_OF_EONS_CAST_BUFF_LINK,
    reverseLinkRelation: BREATH_OF_EONS_CAST_BUFF_LINK,
    linkingEventId: TALENTS.BREATH_OF_EONS_TALENT.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RemoveBuff, EventType.Cast],
    referencedEventId: TALENTS.BREATH_OF_EONS_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RemoveBuff, EventType.Cast],
    anyTarget: true,
    forwardBufferMs: BREATH_OF_EONS_BUFF_BUFFER,
  },
  {
    linkRelation: BREATH_OF_EONS_DAMAGE_LINK,
    reverseLinkRelation: BREATH_OF_EONS_DAMAGE_LINK,
    linkingEventId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
    linkingEventType: EventType.RemoveDebuff,
    referencedEventId: SPELLS.BREATH_OF_EONS_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: false,
    forwardBufferMs: BREATH_OF_EONS_DAMAGE_BUFFER,
  },
  {
    linkRelation: PUPIL_OF_ALEXSTRASZA_LINK,
    reverseLinkRelation: PUPIL_OF_ALEXSTRASZA_LINK,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    maximumLinks: 2,
    forwardBufferMs: PUPIL_OF_ALEXSTRASZA_BUFFER,
  },
  {
    linkRelation: ERUPTION_CAST_DAM_LINK,
    reverseLinkRelation: ERUPTION_CAST_DAM_LINK,
    linkingEventId: TALENTS.ERUPTION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.ERUPTION_TALENT.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: ESSENCE_BURST_GENERATED,
    reverseLinkRelation: ESSENCE_BURST_GENERATED,
    linkingEventId: TALENTS.PRESCIENCE_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  {
    linkRelation: FAILED_EXTENSION_LINK,
    reverseLinkRelation: FAILED_EXTENSION_LINK,
    linkingEventId: [
      SPELLS.FIRE_BREATH.id,
      SPELLS.FIRE_BREATH_FONT.id,
      SPELLS.UPHEAVAL.id,
      SPELLS.UPHEAVAL_FONT.id,
    ],
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    forwardBufferMs: 850,
  },
  {
    linkRelation: FAILED_EXTENSION_LINK,
    reverseLinkRelation: FAILED_EXTENSION_LINK,
    linkingEventId: TALENTS.ERUPTION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    referencedEventType: EventType.RemoveBuff,
    anyTarget: true,
    forwardBufferMs: 850,
  },
  {
    linkRelation: ERUPTION_CHITIN_LINK,
    reverseLinkRelation: ERUPTION_CHITIN_LINK,
    linkingEventId: TALENTS.ERUPTION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: TALENTS.BLISTERING_SCALES_TALENT.id,
    referencedEventType: EventType.ApplyBuffStack,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  // This is set to lower priority than default since
  // to create proper links on events fabcricated using PrePullCooldownsNormalizer
  // We need to ensure this runs after the PrePullCooldownsNormalizer
  // This is neccessary if we want BreathOfEons module to function properly
  // With pre-pull casts of Breath of Eons
  priority = 100;
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrescienceBuffEvents(event: CastEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(event, PRESCIENCE_BUFF_CAST_LINK).filter(
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RefreshBuff,
  );
}

export function getEbonMightBuffEvents(event: ApplyBuffEvent | RefreshBuffEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(event, EBON_MIGHT_BUFF_LINKS).filter(
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RefreshBuff,
  );
}

export function getBreathOfEonsDebuffApplyEvents(event: CastEvent): ApplyDebuffEvent[] {
  return GetRelatedEvents(event, BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK).filter(
    (e): e is ApplyDebuffEvent => e.type === EventType.ApplyDebuff,
  );
}

export function getBreathOfEonsBuffEvents(event: CastEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(event, BREATH_OF_EONS_CAST_BUFF_LINK).filter(
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RemoveBuff,
  );
}

export function getBreathOfEonsDamageEvents(event: RemoveDebuffEvent): DamageEvent[] {
  return GetRelatedEvents(event, BREATH_OF_EONS_DAMAGE_LINK).filter(
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getEruptionDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(event, ERUPTION_CAST_DAM_LINK).filter(
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getPupilDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(event, PUPIL_OF_ALEXSTRASZA_LINK).filter(
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function chitinBuffStackGained(event: CastEvent) {
  return HasRelatedEvent(event, ERUPTION_CHITIN_LINK);
}

export function isFromTipTheScales(event: CastEvent) {
  return HasRelatedEvent(event, TIP_THE_SCALES_CONSUME);
}

export function ebonIsFromBreath(event: ApplyBuffEvent) {
  return HasRelatedEvent(event, BREATH_EBON_APPLY_LINK);
}

export function generatedEssenceBurst(event: CastEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_GENERATED);
}

export function failedEbonMightExtention(event: CastEvent | EmpowerEndEvent) {
  return HasRelatedEvent(event, FAILED_EXTENSION_LINK);
}

export default CastLinkNormalizer;
