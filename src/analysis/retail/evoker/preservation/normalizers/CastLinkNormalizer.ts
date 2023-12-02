import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS/evoker';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  AbilityEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { DUPLICATION_SPELLS, STASIS_CAST_IDS } from '../constants';
import { TIERS } from 'game/TIERS';
import { LEAPING_FLAMES_HITS } from '../../shared/modules/normalizers/LeapingFlamesNormalizer';

export const ANCIENT_FLAME = 'AncientFlame'; // links cast to buff apply
export const ANCIENT_FLAME_CONSUME = 'AncientFlameConnsume'; // links buff remove to buff apply
export const EMPOWERED_CAST = 'EmpoweredCast'; // link empowerend to cast
// BEGIN ECHO constants
export const FROM_HARDCAST = 'FromHardcast'; // for linking a buffapply or heal to its cast
export const FROM_TEMPORAL_ANOMALY = 'FromTemporalAnomaly'; // for linking TA echo apply to TA shield apply
export const FROM_TIER = 'FromTier'; // for linking tier echo apply to tier lf damage/heal
export const ECHO_REMOVAL = 'EchoRemoval'; // for linking echo removal to echo apply
export const TA_ECHO_REMOVAL = 'TaEchoTemoval'; // for linking TA echo removal to echo apply
export const TIER_ECHO_REMOVAL = 'TierEchoRemoval'; // for linking tier echo to echo apply
export const ECHO_TEMPORAL_ANOMALY = 'TemporalAnomaly'; // for linking BuffApply/Heal to echo removal
export const ECHO = 'Echo'; // for linking BuffApply/Heal to echo removal
export const ECHO_TIER = 'EchoT31'; // for linking BuffApply/Heal to echo removal
// END ECHO constants
export const ESSENCE_BURST_LINK = 'EssenceBurstLink'; // link eb removal to apply
export const ESSENCE_BURST_CONSUME = 'EssenceBurstConsumption'; // link essence cast to removing the essence burst buff
export const DREAM_BREATH_CALL_OF_YSERA = 'DreamBreathCallOfYsera'; // link DB hit to buff removal
export const DREAM_BREATH_CALL_OF_YSERA_HOT = 'DreamBreathCallOfYseraHoT'; // link DB hot to buff removal
export const FIELD_OF_DREAMS_PROC = 'FromFieldOfDreams'; // link EB heal to fluttering heal
export const GOLDEN_HOUR = 'GoldenHour'; // link GH heal to reversion application
export const LIFEBIND = 'Lifebind'; // link lifebind buff apply to lifebind heal event
export const LIFEBIND_APPLY = 'LifebindApply'; // link lifebind apply to verdant embrace
export const LIFEBIND_HEAL = 'LifebindHeal'; // link lifebind heal to trigger heal event
export const LIVING_FLAME_CALL_OF_YSERA = 'LivingFlameCallOfYsera'; // link buffed living flame to buff removal
export const HEAL_GROUPING = 'HealGrouping'; // link EB healevents and TA pulses together to easily fetch groups of heals/absorbs
export const ECHO_HEAL_GROUPING = 'HealGrouping'; // link EB healevents and TA pulses together to easily fetch groups of heals/absorbs
export const BUFF_GROUPING = 'BuffGrouping'; // link ApplyBuff events together
export const SHIELD_FROM_TA_CAST = 'ShieldFromTACast';
export const SPARK_OF_INSIGHT = 'SparkOfInsight'; // link TC stack removals to Spark
export const STASIS = 'Stasis';
export const STASIS_FOR_RAMP = 'ForRamp';
export const ESSENCE_RUSH = 'EssenceRush';
export const T31_2PC = 'T31LFProc';

export enum ECHO_TYPE {
  NONE,
  TA,
  HARDCAST,
  TIER,
}

const CAST_BUFFER_MS = 100;
const ECHO_BUFFER = 5000;
const EB_BUFFER_MS = 1500;
const EB_VARIANCE_BUFFER = 150; // servers are bad and EB can take over or under 1.5s to actually trigger
const LIFEBIND_BUFFER = 5000 + CAST_BUFFER_MS; // 5s duration
const MAX_ECHO_DURATION = 20000; // 15s with 30% inc = 19s
const MAX_ESSENCE_BURST_DURATION = 32000; // 15s duration can refresh to 30s with 2s of buffer
const TA_BUFFER_MS = 6000 + CAST_BUFFER_MS; //TA pulses over 6s at 0% haste
const STASIS_BUFFER = 1000;
const T31_LF_AMOUNT = 3;

/*
  This file is for attributing echo applications to hard casts or to temporal anomaly.
  It is needed because echo can apply indrectly from temporal anomaly and
  not just from a hard cast and has a reduced transfer rate
*/

const EVENT_LINKS: EventLink[] = [
  /* ECHO CAST TO ECHO APPLY LINKING */
  //link shield apply to cast event
  {
    linkRelation: SHIELD_FROM_TA_CAST,
    linkingEventId: [SPELLS.TEMPORAL_ANOMALY_SHIELD.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: TA_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT);
    },
  },
  {
    linkRelation: EMPOWERED_CAST,
    linkingEventId: [
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.DREAM_BREATH_FONT.id,
    ],
    linkingEventType: EventType.Cast,
    referencedEventId: [
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.DREAM_BREATH_FONT.id,
    ],
    referencedEventType: EventType.EmpowerEnd,
    reverseLinkRelation: EMPOWERED_CAST,
    forwardBufferMs: 5000,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as CastEvent).ability.guid ===
        (referencedEvent as EmpowerEndEvent).ability.guid
      );
    },
  },
  // link Echo apply to its CastEvent
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  //link echo apply to the Temporal Anomaly shield application
  {
    linkRelation: FROM_TEMPORAL_ANOMALY,
    reverseLinkRelation: FROM_TEMPORAL_ANOMALY,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
    additionalCondition(linkedEvent, referencedEvent) {
      return !HasRelatedEvent(linkedEvent, FROM_HARDCAST);
    },
  },
  {
    linkRelation: FROM_TIER,
    reverseLinkRelation: FROM_TIER,
    linkingEventId: [SPELLS.LIVING_FLAME_CAST.id, SPELLS.LIVING_FLAME_HEAL.id],
    linkingEventType: [EventType.Heal, EventType.Cast],
    referencedEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: STASIS_BUFFER * 3,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        !HasRelatedEvent(referencedEvent, FROM_HARDCAST) &&
        !HasRelatedEvent(referencedEvent, FROM_TEMPORAL_ANOMALY) &&
        !HasRelatedEvent(referencedEvent, FROM_TIER)
      );
    },
    isActive(c) {
      return c.has4PieceByTier(TIERS.T31);
    },
  },
  /* ECHO APPLY TO ECHO REMOVAL LINKING */
  // link echo removal to echo apply
  {
    linkRelation: ECHO_REMOVAL,
    reverseLinkRelation: ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_HARDCAST);
    },
  },
  // link ta echo removal to apply
  {
    linkRelation: TA_ECHO_REMOVAL,
    reverseLinkRelation: TA_ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_TEMPORAL_ANOMALY);
    },
  },
  {
    linkRelation: TIER_ECHO_REMOVAL,
    reverseLinkRelation: TIER_ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_TIER);
    },
  },
  /* ECHO REMOVAL TO HOT APPLY */
  //link hardcast echo removal to hot application
  {
    linkRelation: ECHO,
    reverseLinkRelation: ECHO,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(linkedEvent, ECHO_REMOVAL);
    },
  },
  //link TA echo removal to hot application
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    reverseLinkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO)
      );
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  //link tier echo removal to hot application
  {
    linkRelation: ECHO_TIER,
    reverseLinkRelation: ECHO_TIER,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TIER_ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO) &&
        !HasRelatedEvent(referencedEvent, ECHO_TEMPORAL_ANOMALY)
      );
    },
    isActive(c) {
      return c.has4PieceByTier(TIERS.T31);
    },
  },
  /* ECHO REMOVAL TO HEAL */
  // link echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO,
    reverseLinkRelation: ECHO,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.SPIRITBLOOM.id,
      SPELLS.VERDANT_EMBRACE_HEAL.id,
    ],
    referencedEventType: EventType.Heal,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, ECHO_REMOVAL);
    },
  },
  // link EB heal to echo remove
  {
    linkRelation: ECHO,
    reverseLinkRelation: ECHO,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, ECHO_REMOVAL);
    },
  },
  // link EB heal to echo remove
  {
    linkRelation: ECHO_TIER,
    reverseLinkRelation: ECHO_TIER,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, TIER_ECHO_REMOVAL);
    },
  },
  // link TA echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    reverseLinkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.VERDANT_EMBRACE_HEAL.id,
    ],
    referencedEventType: EventType.Heal,
    maximumLinks: 1,
    forwardBufferMs: ECHO_BUFFER,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        HasRelatedEvent(linkingEvent, FROM_TEMPORAL_ANOMALY) &&
        HasRelatedEvent(linkingEvent, FROM_TEMPORAL_ANOMALY) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO)
      );
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // link tier echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO_TIER,
    reverseLinkRelation: ECHO_TIER,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM.id,
      SPELLS.SPIRITBLOOM_FONT.id,
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.VERDANT_EMBRACE_HEAL.id,
    ],
    referencedEventType: EventType.Heal,
    maximumLinks: 1,
    forwardBufferMs: ECHO_BUFFER,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TIER_ECHO_REMOVAL) &&
        HasRelatedEvent(linkingEvent, FROM_TIER) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO) &&
        !HasRelatedEvent(referencedEvent, ECHO_TEMPORAL_ANOMALY)
      );
    },
    isActive(c) {
      return c.has4PieceByTier(TIERS.T31);
    },
  },
  // special handling for TA Echo EB because it heals 3-5 targets and happens after 2s
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    reverseLinkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    referencedEventType: EventType.Heal,
    forwardBufferMs: EB_BUFFER_MS + 250,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(linkingEvent, TA_ECHO_REMOVAL) &&
        !HasRelatedEvent(linkingEvent, ECHO_REMOVAL) &&
        !HasRelatedEvent(referencedEvent, ECHO)
      );
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // link eb heal proc to fluttering heal
  {
    linkRelation: FIELD_OF_DREAMS_PROC,
    linkingEventId: SPELLS.EMERALD_BLOSSOM.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.FLUTTERING_SEEDLINGS_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    backwardBufferMs: EB_BUFFER_MS + 500,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      const diff = EB_BUFFER_MS - (linkingEvent.timestamp - referencedEvent.timestamp);
      return Math.abs(diff) < EB_VARIANCE_BUFFER;
    },
  },
  //link Call of Ysera Removal to the heals
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA_HOT,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.Heal],
    referencedEventId: [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Dream Breath cast that consumed it
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA,
    linkingEventId: SPELLS.CALL_OF_YSERA_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.EmpowerEnd,
    maximumLinks: 1,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Living Flame heal that consumed it
  {
    linkRelation: LIVING_FLAME_CALL_OF_YSERA,
    linkingEventId: SPELLS.LIVING_FLAME_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.CALL_OF_YSERA_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    backwardBufferMs: 1100,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT);
    },
  },
  // link essence burst remove to a cast to track expirations vs consumptions
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM_CAST.id,
      SPELLS.DISINTEGRATE.id,
      TALENTS_EVOKER.ECHO_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT);
    },
  },
  {
    linkRelation: ESSENCE_BURST_LINK,
    reverseLinkRelation: ESSENCE_BURST_LINK,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuffStack, EventType.ApplyBuff],
    referencedEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    referencedEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    forwardBufferMs: MAX_ESSENCE_BURST_DURATION,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT);
    },
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, ESSENCE_BURST_LINK);
    },
  },
  // group TA shields and EB heals together for easy batch processing
  {
    linkRelation: HEAL_GROUPING,
    linkingEventId: [
      SPELLS.EMERALD_BLOSSOM.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
    ],
    linkingEventType: [EventType.Heal, EventType.ApplyBuff],
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
    ],
    referencedEventType: EventType.Heal,
    anyTarget: true,
    forwardBufferMs: 25,
    backwardBufferMs: 25,
    additionalCondition(linkingEvent, referencedEvent) {
      if (
        (linkingEvent as AbilityEvent<any>).ability.guid !==
        (referencedEvent as AbilityEvent<any>).ability.guid
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.Heal &&
        (linkingEvent as HealEvent).targetID === (referencedEvent as HealEvent).targetID
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.ApplyBuff &&
        (linkingEvent as ApplyBuffEvent).targetID === (referencedEvent as ApplyBuffEvent).targetID
      ) {
        return false;
      }
      return (
        !HasRelatedEvent(linkingEvent, ECHO) &&
        !HasRelatedEvent(linkingEvent, ECHO_TEMPORAL_ANOMALY) &&
        !HasRelatedEvent(referencedEvent, ECHO) &&
        !HasRelatedEvent(referencedEvent, ECHO_TEMPORAL_ANOMALY)
      );
    },
  },
  // group echo heals together
  {
    linkRelation: ECHO_HEAL_GROUPING,
    linkingEventId: [SPELLS.EMERALD_BLOSSOM_ECHO.id, SPELLS.SPIRITBLOOM_SPLIT.id],
    linkingEventType: [EventType.Heal, EventType.ApplyBuff],
    referencedEventId: [SPELLS.EMERALD_BLOSSOM_ECHO.id, SPELLS.SPIRITBLOOM_SPLIT.id],
    referencedEventType: EventType.Heal,
    anyTarget: true,
    forwardBufferMs: 25,
    backwardBufferMs: 25,
    additionalCondition(linkingEvent, referencedEvent) {
      if (
        (linkingEvent as AbilityEvent<any>).ability.guid !==
        (referencedEvent as AbilityEvent<any>).ability.guid
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.Heal &&
        (linkingEvent as HealEvent).targetID === (referencedEvent as HealEvent).targetID
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.ApplyBuff &&
        (linkingEvent as ApplyBuffEvent).targetID === (referencedEvent as ApplyBuffEvent).targetID
      ) {
        return false;
      }
      return true;
    },
  },
  // link dream breath applications together
  {
    linkRelation: BUFF_GROUPING,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_FONT.id],
    linkingEventType: EventType.ApplyBuff,
    referencedEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_FONT.id],
    referencedEventType: EventType.ApplyBuff,
    anyTarget: true,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        (linkingEvent as ApplyBuffEvent).targetID !== (referencedEvent as ApplyBuffEvent).targetID
      );
    },
  },
  // stasis stack removal to cast
  {
    linkRelation: STASIS,
    reverseLinkRelation: STASIS,
    linkingEventId: TALENTS_EVOKER.STASIS_TALENT.id,
    linkingEventType: [EventType.RemoveBuffStack, EventType.RemoveBuff],
    referencedEventId: STASIS_CAST_IDS,
    referencedEventType: EventType.Cast,
    backwardBufferMs: STASIS_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      const refEvent = referencedEvent as CastEvent;
      // need to ignore living flame casts on enemy
      if (!refEvent.targetIsFriendly && (!refEvent.target || refEvent.target.guid !== 0)) {
        return false;
      }
      return (
        !HasRelatedEvent(referencedEvent, EMPOWERED_CAST) &&
        !HasRelatedEvent(referencedEvent, STASIS)
      );
    },
  },
  {
    linkRelation: STASIS,
    reverseLinkRelation: STASIS,
    linkingEventId: TALENTS_EVOKER.STASIS_TALENT.id,
    linkingEventType: [EventType.RemoveBuffStack, EventType.RemoveBuff],
    referencedEventId: [
      TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      SPELLS.DREAM_BREATH_FONT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
    ],
    referencedEventType: EventType.EmpowerEnd,
    backwardBufferMs: STASIS_BUFFER,
    anyTarget: true,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      return (
        HasRelatedEvent(referencedEvent, EMPOWERED_CAST) &&
        !HasRelatedEvent(referencedEvent, STASIS)
      );
    },
  },
  {
    linkRelation: LIFEBIND,
    linkingEventId: SPELLS.LIFEBIND_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.LIFEBIND_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: LIFEBIND_BUFFER,
  },
  {
    linkRelation: LIFEBIND_APPLY,
    reverseLinkRelation: LIFEBIND_APPLY,
    linkingEventId: SPELLS.LIFEBIND_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.VERDANT_EMBRACE_HEAL.id,
    referencedEventType: EventType.Heal,
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      // ve applies lifebind to player and target but there is no ve heal on player
      const applyEvent = linkingEvent as ApplyBuffEvent;
      return (
        applyEvent.targetID === (referencedEvent as HealEvent).targetID ||
        applyEvent.targetID === applyEvent.sourceID
      );
    },
  },
  {
    linkRelation: LIFEBIND_HEAL,
    linkingEventId: SPELLS.LIFEBIND_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: DUPLICATION_SPELLS,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    maximumLinks: 1,
    backwardBufferMs: 50,
    forwardBufferMs: 50,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(linkingEvent, LIFEBIND); // make sure the heal is on someone with lifebind buff
    },
  },
  {
    linkRelation: GOLDEN_HOUR,
    linkingEventId: SPELLS.GOLDEN_HOUR_HEAL.id,
    linkingEventType: EventType.Heal,
    referencedEventId: [TALENTS_EVOKER.REVERSION_TALENT.id, SPELLS.REVERSION_ECHO.id],
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: ECHO_BUFFER,
    forwardBufferMs: ECHO_BUFFER,
    maximumLinks: 1,
  },
  {
    linkRelation: SPARK_OF_INSIGHT,
    reverseLinkRelation: SPARK_OF_INSIGHT,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    referencedEventId: SPELLS.TEMPORAL_COMPRESSION_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.SPARK_OF_INSIGHT_TALENT);
    },
  },
  {
    linkRelation: ESSENCE_RUSH,
    reverseLinkRelation: ESSENCE_RUSH,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    referencedEventId: ITEMS.T30_ESSENCE_RUSH.id,
    referencedEventType: EventType.ApplyBuff,
    backwardBufferMs: 5000,
  },
  {
    linkRelation: FROM_HARDCAST,
    reverseLinkRelation: FROM_HARDCAST,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.ApplyBuffStack, EventType.RefreshBuff],
    referencedEventId: [
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.LIVING_FLAME_DAMAGE.id,
      SPELLS.LIVING_FLAME_CAST.id,
    ],
    referencedEventType: [EventType.Cast, EventType.Damage, EventType.Heal],
    backwardBufferMs: 1500, // very large delay between application and lf event sometimes
    forwardBufferMs: 10, // ordering
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(linkingEvent, ESSENCE_RUSH);
    },
  },
  {
    linkRelation: STASIS_FOR_RAMP,
    linkingEventId: SPELLS.STASIS_BUFF.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id,
    referencedEventType: EventType.ApplyBuff,
    forwardBufferMs: MAX_ECHO_DURATION + 3000,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.EMERALD_COMMUNION_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.STASIS_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  {
    linkRelation: ANCIENT_FLAME,
    reverseLinkRelation: ANCIENT_FLAME,
    linkingEventId: [TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id, SPELLS.EMERALD_BLOSSOM_CAST.id],
    linkingEventType: EventType.Cast,
    referencedEventId: SPELLS.ANCIENT_FLAME_BUFF.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    maximumLinks: 1,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ANCIENT_FLAME_TALENT);
    },
  },
  {
    linkRelation: ANCIENT_FLAME_CONSUME,
    reverseLinkRelation: ANCIENT_FLAME_CONSUME,
    linkingEventId: SPELLS.ANCIENT_FLAME_BUFF.id,
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.ANCIENT_FLAME_BUFF.id,
    referencedEventType: EventType.RemoveBuff,
    maximumLinks: 1,
    forwardBufferMs: 1000 * 60 * 20, // has no duration so lets use safe upper bound on fight duration
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ANCIENT_FLAME_TALENT);
    },
  },
  {
    linkRelation: T31_2PC,
    reverseLinkRelation: T31_2PC,
    linkingEventId: [
      SPELLS.FIRE_BREATH.id,
      SPELLS.FIRE_BREATH_FONT.id,
      TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
      TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
      SPELLS.DREAM_BREATH_FONT.id,
      SPELLS.SPIRITBLOOM_FONT.id,
    ],
    linkingEventType: [EventType.EmpowerEnd, EventType.Cast],
    referencedEventId: [SPELLS.LIVING_FLAME_DAMAGE.id, SPELLS.LIVING_FLAME_HEAL.id],
    referencedEventType: [EventType.Damage, EventType.Heal],
    maximumLinks: T31_LF_AMOUNT,
    forwardBufferMs: EB_BUFFER_MS * 2, // travel time
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, LEAPING_FLAMES_HITS);
    },
  },
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/RemoveBuff linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for Echo and Temporal Anomaly
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcastEcho(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, ECHO) || HasRelatedEvent(event, ECHO_REMOVAL);
}

export function isFromTAEcho(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  return HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY) || HasRelatedEvent(event, TA_ECHO_REMOVAL);
}

export function isEchoFromT314PC(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  return (
    HasRelatedEvent(event, ECHO_TIER) ||
    HasRelatedEvent(event, FROM_TIER) ||
    HasRelatedEvent(event, TIER_ECHO_REMOVAL)
  );
}

export function isFromDreamBreathCallOfYsera(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  if (HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA)) {
    return false;
  }
  return HasRelatedEvent(event, DREAM_BREATH_CALL_OF_YSERA_HOT);
}

export function isFromLivingFlameCallOfYsera(event: HealEvent) {
  return HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA);
}

export function isFromFieldOfDreams(event: HealEvent) {
  return HasRelatedEvent(event, FIELD_OF_DREAMS_PROC);
}

export function didEchoExpire(event: RemoveBuffEvent) {
  return !HasRelatedEvent(event, ECHO) && !HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY);
}

export function isFromHardcast(event: ApplyBuffEvent) {
  return HasRelatedEvent(event, FROM_HARDCAST);
}

export function getEssenceBurstConsumeAbility(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): null | CastEvent {
  return GetRelatedEvent<CastEvent>(event, ESSENCE_BURST_CONSUME) ?? null;
}

export function getHealForLifebindHeal(event: HealEvent): HealEvent | null {
  if (!HasRelatedEvent(event, LIFEBIND_HEAL)) {
    event.__modified = false;
    return null;
  }
  return GetRelatedEvent<HealEvent>(event, LIFEBIND_HEAL)!;
}

export function getEchoTypeForLifebind(event: HealEvent): ECHO_TYPE {
  if (!HasRelatedEvent(event, LIFEBIND) || event.targetID === event.sourceID) {
    return ECHO_TYPE.NONE;
  }
  const lifebindApplyEvent: ApplyBuffEvent = GetRelatedEvent(event, LIFEBIND)!;
  if (lifebindApplyEvent.prepull) {
    return ECHO_TYPE.NONE;
  }
  const veHeal: HealEvent = GetRelatedEvent(lifebindApplyEvent, LIFEBIND_APPLY)!;
  if (HasRelatedEvent(veHeal, ECHO)) {
    return ECHO_TYPE.HARDCAST;
  } else if (HasRelatedEvent(veHeal, ECHO_TEMPORAL_ANOMALY)) {
    return ECHO_TYPE.TA;
  }
  return ECHO_TYPE.NONE;
}

export function getEchoTypeForGoldenHour(event: HealEvent): ECHO_TYPE {
  const reversionEvent = GetRelatedEvent<ApplyBuffEvent | RefreshBuffEvent>(event, GOLDEN_HOUR)!;
  if (isFromHardcastEcho(reversionEvent)) {
    return ECHO_TYPE.HARDCAST;
  } else if (isFromTAEcho(reversionEvent)) {
    return ECHO_TYPE.TA;
  }
  return ECHO_TYPE.NONE;
}

export function getHealEvents(event: HealEvent) {
  return [event].concat(GetRelatedEvents<HealEvent>(event, HEAL_GROUPING));
}

export function getEchoHealEvents(event: HealEvent) {
  return [event].concat(GetRelatedEvents<HealEvent>(event, ECHO_HEAL_GROUPING));
}

export function getBuffEvents(event: ApplyBuffEvent) {
  return [event].concat(GetRelatedEvents<ApplyBuffEvent>(event, BUFF_GROUPING));
}

export function getStasisSpell(event: RemoveBuffStackEvent | RemoveBuffEvent): number | null {
  const stasisEvent = GetRelatedEvent<CastEvent | EmpowerEndEvent>(event, STASIS);
  if (!stasisEvent) {
    return null;
  }
  if (stasisEvent.type === EventType.Cast) {
    return stasisEvent.ability.guid;
  }
  return stasisEvent.ability.guid;
}

export function didSparkProcEssenceBurst(
  event: ApplyBuffEvent | RemoveBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent,
) {
  return HasRelatedEvent(event, SPARK_OF_INSIGHT);
}

export function didEbConsumeSparkProc(event: RemoveBuffEvent | RemoveBuffStackEvent) {
  const applyEvent = GetRelatedEvent(event, ESSENCE_BURST_LINK)!;
  return HasRelatedEvent(applyEvent, SPARK_OF_INSIGHT);
}

export function wasEbConsumed(event: ApplyBuffEvent | ApplyBuffStackEvent) {
  return HasRelatedEvent(event, ESSENCE_BURST_LINK);
}

export function isStasisForRamp(event: RemoveBuffEvent) {
  return HasRelatedEvent(event, STASIS_FOR_RAMP);
}

export function isEbFromT30Tier(
  event:
    | RemoveBuffEvent
    | RemoveBuffStackEvent
    | ApplyBuffEvent
    | RefreshBuffEvent
    | ApplyBuffStackEvent,
) {
  if ([EventType.RefreshBuff, EventType.ApplyBuff, EventType.ApplyBuffStack].includes(event.type)) {
    return !HasRelatedEvent(event, FROM_HARDCAST) && !HasRelatedEvent(event, SPARK_OF_INSIGHT);
  }
  const applyEvent = GetRelatedEvent(event, ESSENCE_BURST_LINK)!;
  return (
    !HasRelatedEvent(applyEvent, FROM_HARDCAST) && !HasRelatedEvent(applyEvent, SPARK_OF_INSIGHT)
  );
}

export function isEbFromT31Tier(
  event:
    | RemoveBuffEvent
    | RemoveBuffStackEvent
    | ApplyBuffEvent
    | RefreshBuffEvent
    | ApplyBuffStackEvent,
) {
  // get lf event -> check if lf is from 2 set
  const applyEvent =
    event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack
      ? event
      : GetRelatedEvent(event, ESSENCE_BURST_LINK);
  if (!applyEvent) {
    return false;
  }
  const lfEvent = GetRelatedEvent(applyEvent, FROM_HARDCAST);
  if (!lfEvent) {
    return false;
  }
  return HasRelatedEvent(lfEvent, T31_2PC);
}

export function isLfFromT31Tier(event: DamageEvent | HealEvent) {
  return HasRelatedEvent(event, T31_2PC);
}

export function getAncientFlameSource(event: ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent) {
  return GetRelatedEvent(
    event,
    event.type === EventType.RemoveBuff ? ANCIENT_FLAME_CONSUME : ANCIENT_FLAME,
  )!;
}

export default CastLinkNormalizer;
