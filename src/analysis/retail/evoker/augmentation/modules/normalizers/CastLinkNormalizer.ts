import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HasTarget,
  RefreshBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import PrePullCooldowns from 'parser/shared/normalizers/PrePullCooldowns';
import { LEAPING_FLAMES_HITS } from 'analysis/retail/evoker/shared/modules/normalizers/LeapingFlamesNormalizer';
import { BREATH_OF_EONS_SPELL_IDS } from '../../constants';

/** So sometimes when Ebon Might should be extended
 * it just kinda doesn't? This messes with our analysis so
 * let's check if it failed to extend where it should
 * See example of this here (upheaval should have extended but didn't):
 * https://www.warcraftlogs.com/reports/1JqKrX2vLxb6Zyp9/#fight=8&source=3&pins=2%24Off%24%23244F4B%24expression%24type%20%3D%20%22empowerend%22%20or%20type%3D%22removebuff%22&view=events&start=1402475&end=1408776
 */
const FAILED_EXTENSION_LINK = 'failedExtensionLink';

const PRESCIENCE_BUFF_CAST_LINK = 'prescienceBuffCastLink';
export const PRESCIENCE_APPLY_REMOVE_LINK = 'prescienceApplyRemoveLink';
export const BREATH_EBON_APPLY_LINK = 'breathEbonApplyLink';
export const EBON_MIGHT_BUFF_LINKS = 'ebonMightBuffLinks';
export const EBON_MIGHT_APPLY_REMOVE_LINK = 'ebonMightApplyRemoveLink';

export const BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK = 'breathOfEonsCastDebuffApplyLink';
export const BREATH_OF_EONS_CAST_BUFF_LINK = 'breathOfEonsCastBuffLink';
export const BREATH_OF_EONS_DAMAGE_LINK = 'breathOfEonsDamageLink';
export const BREATH_OF_EONS_DEBUFF_LINK = 'breathOfEonsDebuffLink';

const ERUPTION_CAST_DAM_LINK = 'eruptionCastDamLink';
const ERUPTION_CHITIN_LINK = 'eruptionChitinLink';
const PUPIL_OF_ALEXSTRASZA_LINK = 'pupilOfAlexstraszaLink';
export const UPHEAVAL_CAST_DAM_LINK = 'upheavalCastDamLink';
export const UPHEAVAL_RUMBLING_EARTH_LINK = 'upheavalRumblingEarthLink';
// Tier
export const TREMBLING_EARTH_DAM_LINK = 'tremblingEarthDamLink';

export const MASS_ERUPTION_DAM_LINK = 'massEruptionDamLink';
export const MASS_ERUPTION_CONSUME = 'massEruptionConsume';
const MASS_ERUPTION_DAMAGE_BUFFER = 1000; // These have very spooky delay

const PRESCIENCE_BUFFER = 150;
const CAST_BUFFER_MS = 100;
const BREATH_EBON_BUFFER = 250;
const EBON_MIGHT_BUFFER = 150;
const BREATH_OF_EONS_DEBUFF_APPLY_BUFFER = 8000;
const BREATH_OF_EONS_BUFF_BUFFER = 8000;
const BREATH_OF_EONS_DEBUFF_BUFFER = 14000;
const BREATH_OF_EONS_DAMAGE_BUFFER = 100;
const PUPIL_OF_ALEXSTRASZA_BUFFER = 1000;
const UPHEAVAL_DAMAGE_BUFFER = 800;

// Tier
// No clue why but this gets very weirdly staggered/delayed
const TREMBLING_EARTH_BUFFER = 500;

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
    linkRelation: BREATH_EBON_APPLY_LINK,
    reverseLinkRelation: BREATH_EBON_APPLY_LINK,
    linkingEventId: BREATH_OF_EONS_SPELL_IDS,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    forwardBufferMs: BREATH_EBON_BUFFER,
  },
  {
    linkRelation: EBON_MIGHT_BUFF_LINKS,
    reverseLinkRelation: EBON_MIGHT_BUFF_LINKS,
    linkingEventId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    anyTarget: true,
    maximumLinks: 4,
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
    anyTarget: false,
  },
  {
    linkRelation: BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK,
    reverseLinkRelation: BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK,
    linkingEventId: BREATH_OF_EONS_SPELL_IDS,
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
    linkingEventId: BREATH_OF_EONS_SPELL_IDS,
    linkingEventType: [EventType.Cast],
    referencedEventId: BREATH_OF_EONS_SPELL_IDS,
    referencedEventType: [EventType.ApplyBuff, EventType.RemoveBuff],
    anyTarget: true,
    forwardBufferMs: BREATH_OF_EONS_BUFF_BUFFER,
    backwardBufferMs: BREATH_OF_EONS_BUFF_BUFFER,
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
  /**
   * So this is *slightly* cursed, but basically fixes an issue with mobs sharing HP eg. Silken Court.
   * Essentially will just apply links backwards if no link is already present.
   * example log:
   * https://www.warcraftlogs.com/reports/zCvY2PKpHtd6MqAW#fight=4&type=auras&pins=0%24Separate%24%23244F4B%24damage%240%240.0.0.Any%24184027896.0.0.Evoker%24true%240.0.0.Any%24false%24409632&hostility=1&spells=debuffs&target=217&ability=409560&view=events&start=4819003&end=4837682
   */
  {
    linkRelation: BREATH_OF_EONS_DAMAGE_LINK,
    reverseLinkRelation: BREATH_OF_EONS_DAMAGE_LINK,
    linkingEventId: SPELLS.BREATH_OF_EONS_DAMAGE.id,
    linkingEventType: EventType.Damage,
    referencedEventId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
    referencedEventType: EventType.RemoveDebuff,
    anyTarget: true,
    maximumLinks: 1,
    backwardBufferMs: BREATH_OF_EONS_DAMAGE_BUFFER,
    additionalCondition(linkingEvent, _referencedEvent) {
      return !HasRelatedEvent(linkingEvent, BREATH_OF_EONS_DAMAGE_LINK);
    },
  },
  {
    linkRelation: BREATH_OF_EONS_DEBUFF_LINK,
    reverseLinkRelation: BREATH_OF_EONS_DEBUFF_LINK,
    linkingEventId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
    linkingEventType: EventType.ApplyDebuff,
    referencedEventId: SPELLS.TEMPORAL_WOUND_DEBUFF.id,
    referencedEventType: EventType.RemoveDebuff,
    anyTarget: false,
    maximumLinks: 1,
    forwardBufferMs: BREATH_OF_EONS_DEBUFF_BUFFER,
  },
  {
    linkRelation: PUPIL_OF_ALEXSTRASZA_LINK,
    reverseLinkRelation: PUPIL_OF_ALEXSTRASZA_LINK,
    linkingEventId: SPELLS.LIVING_FLAME_CAST.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.LIVING_FLAME_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    maximumLinks: 1,
    forwardBufferMs: PUPIL_OF_ALEXSTRASZA_BUFFER,
    isActive(c) {
      return c.hasTalent(TALENTS.PUPIL_OF_ALEXSTRASZA_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      // No targets so we can't be sure which hit is the correct one, so we just claim it
      if (!HasTarget(linkingEvent) && !HasTarget(referencedEvent)) {
        return true;
      }
      return (
        encodeEventTargetString(linkingEvent) !== encodeEventTargetString(referencedEvent) &&
        !HasRelatedEvent(referencedEvent, LEAPING_FLAMES_HITS)
      );
    },
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
  // Tier
  {
    linkRelation: TREMBLING_EARTH_DAM_LINK,
    reverseLinkRelation: TREMBLING_EARTH_DAM_LINK,
    linkingEventId: SPELLS.TREMBLING_EARTH_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.TREMBLING_EARTH_DAM.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: TREMBLING_EARTH_BUFFER,
    backwardBufferMs: TREMBLING_EARTH_BUFFER,
  },
  {
    linkRelation: UPHEAVAL_CAST_DAM_LINK,
    reverseLinkRelation: UPHEAVAL_CAST_DAM_LINK,
    linkingEventId: [TALENTS.UPHEAVAL_TALENT.id, SPELLS.UPHEAVAL_FONT.id],
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: SPELLS.UPHEAVAL_DAM.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: UPHEAVAL_DAMAGE_BUFFER,
    isActive: (c) => c.hasTalent(TALENTS.UPHEAVAL_TALENT),
    additionalCondition(linkingEvent, referencedEvent) {
      return upheavalHitIsUnique(linkingEvent as EmpowerEndEvent, referencedEvent as DamageEvent);
    },
  },
  {
    linkRelation: UPHEAVAL_RUMBLING_EARTH_LINK,
    reverseLinkRelation: UPHEAVAL_RUMBLING_EARTH_LINK,
    linkingEventId: [TALENTS.UPHEAVAL_TALENT.id, SPELLS.UPHEAVAL_FONT.id],
    linkingEventType: EventType.EmpowerEnd,
    referencedEventId: SPELLS.UPHEAVAL_DAM.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: UPHEAVAL_DAMAGE_BUFFER * 2,
    isActive: (c) => c.hasTalent(TALENTS.RUMBLING_EARTH_TALENT),
    additionalCondition(_linkingEvent, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, UPHEAVAL_CAST_DAM_LINK);
    },
  },
  {
    linkRelation: MASS_ERUPTION_CONSUME,
    reverseLinkRelation: MASS_ERUPTION_CONSUME,
    linkingEventId: TALENTS.ERUPTION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MASS_ERUPTION_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive: (C) => C.hasTalent(TALENTS.MASS_ERUPTION_TALENT),
    maximumLinks: 1,
  },
  {
    linkRelation: MASS_ERUPTION_DAM_LINK,
    reverseLinkRelation: MASS_ERUPTION_DAM_LINK,
    linkingEventId: TALENTS.ERUPTION_TALENT.id,
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.MASS_ERUPTION_DAMAGE.id,
    referencedEventType: EventType.Damage,
    anyTarget: true,
    forwardBufferMs: MASS_ERUPTION_DAMAGE_BUFFER,
    isActive: (C) => C.hasTalent(TALENTS.MASS_ERUPTION_TALENT),
  },
];

class CastLinkNormalizer extends EventLinkNormalizer {
  // We depend on prePullCooldowns since
  // to create proper links on events fabricated using PrePullCooldownsNormalizer
  // We need to ensure this normalizer runs after the PrePullCooldownsNormalizer
  // This is necessary if we want BreathOfEons module to function properly
  // With pre-pull casts of Breath of Eons
  static dependencies = { ...EventLinkNormalizer.dependencies, prePullCooldowns: PrePullCooldowns };
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getPrescienceBuffEvents(event: CastEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(
    event,
    PRESCIENCE_BUFF_CAST_LINK,
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RefreshBuff,
  );
}

export function getEbonMightBuffEvents(event: ApplyBuffEvent | RefreshBuffEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(
    event,
    EBON_MIGHT_BUFF_LINKS,
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RefreshBuff,
  );
}

export function getBreathOfEonsDebuffApplyEvents(event: CastEvent): ApplyDebuffEvent[] {
  return GetRelatedEvents(
    event,
    BREATH_OF_EONS_CAST_DEBUFF_APPLY_LINK,
    (e): e is ApplyDebuffEvent => e.type === EventType.ApplyDebuff,
  );
}

export function getBreathOfEonsBuffEvents(event: CastEvent): ApplyBuffEvent[] {
  return GetRelatedEvents(
    event,
    BREATH_OF_EONS_CAST_BUFF_LINK,
    (e): e is ApplyBuffEvent => e.type === EventType.ApplyBuff || e.type === EventType.RemoveBuff,
  );
}

export function getBreathOfEonsDamageEvents(event: RemoveDebuffEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    BREATH_OF_EONS_DAMAGE_LINK,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getEruptionDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    ERUPTION_CAST_DAM_LINK,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function getPupilDamageEvent(event: CastEvent): DamageEvent | undefined {
  return GetRelatedEvent(
    event,
    PUPIL_OF_ALEXSTRASZA_LINK,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export function chitinBuffStackGained(event: CastEvent) {
  return HasRelatedEvent(event, ERUPTION_CHITIN_LINK);
}

export function ebonIsFromBreath(event: ApplyBuffEvent | CastEvent) {
  return HasRelatedEvent(event, BREATH_EBON_APPLY_LINK);
}

export function failedEbonMightExtension(event: CastEvent | EmpowerEndEvent) {
  return HasRelatedEvent(event, FAILED_EXTENSION_LINK);
}

function upheavalHitIsUnique(castEvent: EmpowerEndEvent, damageEvent: DamageEvent) {
  const previousEvents = GetRelatedEvents<DamageEvent>(castEvent, UPHEAVAL_CAST_DAM_LINK);

  return !previousEvents.some(
    (e) => encodeEventTargetString(e) === encodeEventTargetString(damageEvent),
  );
}

export function isFromMassEruption(event: CastEvent) {
  return HasRelatedEvent(event, MASS_ERUPTION_CONSUME);
}

export function getMassEruptionDamageEvents(event: CastEvent): DamageEvent[] {
  return GetRelatedEvents(
    event,
    MASS_ERUPTION_DAM_LINK,
    (e): e is DamageEvent => e.type === EventType.Damage,
  );
}

export default CastLinkNormalizer;
