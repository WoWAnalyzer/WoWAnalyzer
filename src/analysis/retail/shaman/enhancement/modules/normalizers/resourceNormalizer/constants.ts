import { BufferMs, MaelstromAbilityType, SearchDirection, MatchMode } from './enums';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Combatant from 'parser/core/Combatant';
import { EventType } from 'parser/core/Events';
import { MaelstromAbility, PeriodicGainEffect } from './types';
/**
 * Maelstrom gained from these sources are capped at the values provided
 */
export const MAXIMUM_MAELSTROM_PER_EVENT = {
  [TALENTS.SUPERCHARGE_TALENT.id]: 2,
  [TALENTS.STATIC_ACCUMULATION_TALENT.id]: 10,
};

export const GAIN_EVENT_TYPES = [
  EventType.ApplyBuff,
  EventType.ApplyBuffStack,
  EventType.RefreshBuff,
];

export const SPEND_EVENT_TYPES = [EventType.RemoveBuff, EventType.RemoveBuffStack];

export const MAELSTROM_ABILITIES: Record<string, MaelstromAbility> = {
  SPENDERS: {
    spellId: [
      // Primordial Storm must be listed first as it casts a "free" Lightning Bolt or Chain Lightning
      SPELLS.PRIMORDIAL_STORM_CAST.id,
      SPELLS.LIGHTNING_BOLT.id,
      TALENTS.CHAIN_LIGHTNING_TALENT.id,
      SPELLS.TEMPEST_CAST.id,
      TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
      TALENTS.LAVA_BURST_TALENT.id,
      SPELLS.HEALING_SURGE.id,
      TALENTS.CHAIN_HEAL_TALENT.id,
      TALENTS.LAVA_BURST_TALENT.id,
    ],
    type: MaelstromAbilityType.Spender,
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.Damage,
    backwardsBufferMs: BufferMs.SpendBackward,
    linkToEventType: SPEND_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
  },
  SUPERCHARGE: {
    spellId: [
      SPELLS.LIGHTNING_BOLT.id,
      TALENTS.CHAIN_LIGHTNING_TALENT.id,
      SPELLS.TEMPEST_CAST.id,
      /**
       * Currently any maelstrom spender can proc supercharge, once bug is fixed remove any abilities below this comment
       */
      TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
      TALENTS.CHAIN_HEAL_TALENT.id,
      SPELLS.HEALING_SURGE.id,
      TALENTS.LAVA_BURST_TALENT.id,
    ],
    type: MaelstromAbilityType.Builder,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.SUPERCHARGE_TALENT),
    maximum: MAXIMUM_MAELSTROM_PER_EVENT[TALENTS.SUPERCHARGE_TALENT.id],
    requiresExact: true,
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.Damage,
    spellIdOverride: TALENTS.SUPERCHARGE_TALENT.id,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  STATIC_ACCUMULATION: {
    spellId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id, SPELLS.TEMPEST_CAST.id],
    type: MaelstromAbilityType.Builder,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.STATIC_ACCUMULATION_TALENT),
    maximum: -1,
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.StaticAccumulation,
    spellIdOverride: TALENTS.STATIC_ACCUMULATION_TALENT.id,
    minimumBuffer: 50,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  FERAL_SPIRIT_SUMMONED: {
    spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
    spellIdOverride: TALENTS.FERAL_SPIRIT_TALENT.id,
    linkFromEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.BackwardsFirst,
    forwardBufferMs: 25,
    backwardsBufferMs: 5,
    maximum: 1,
    requiresExact: true,
  },
  VOLTAIC_BLAZE: {
    spellId: SPELLS.VOLTAIC_BLAZE_CAST.id,
    linkFromEventType: EventType.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
    maximum: 1,
    requiresExact: true,
  },
  SWIRLING_MAELSTROM: {
    spellId: [TALENTS.FROST_SHOCK_TALENT.id, TALENTS.FIRE_NOVA_TALENT.id],
    enabled: (c: Combatant) => c.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT),
    linkFromEventType: EventType.Cast,
    spellIdOverride: TALENTS.SWIRLING_MAELSTROM_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    backwardsBufferMs: 5, // backwards buffer seems to only occur for frost shock
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
    matchMode: MatchMode.MatchFirst,
  },
  ELEMENTAL_ASSAULT: {
    spellId: [
      SPELLS.STORMSTRIKE_CAST.id,
      SPELLS.WINDSTRIKE_CAST.id,
      TALENTS.LAVA_LASH_TALENT.id,
      TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
      TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
    ],
    linkFromEventType: EventType.Cast,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
    spellIdOverride: TALENTS.ELEMENTAL_ASSAULT_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  PRIMORDIAL_WAVE: {
    spellId: TALENTS.PRIMORDIAL_WAVE_TALENT.id,
    linkFromEventType: EventType.Cast,
    forwardBufferMs: BufferMs.OnSameTimestamp,
    backwardsBufferMs: BufferMs.PrimordialWave,
    maximum: 5,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.BackwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  ASCENDANCE_PERIODIC_GAIN: {
    spellId: [TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id],
    linkFromEventType: [EventType.ResourceChange, ...GAIN_EVENT_TYPES],
    linkToEventType: GAIN_EVENT_TYPES,
    forwardBufferMs: BufferMs.Ticks * 2,
    backwardsBufferMs: BufferMs.Ticks,
    searchDirection: SearchDirection.ForwardsFirst,
    matchMode: MatchMode.MatchLast,
    maximum: (c: Combatant) => c.getTalentRank(TALENTS.STATIC_ACCUMULATION_TALENT),
    requiresExact: true,
    updateExistingEvent: true,
  },
  FERAL_SPIRIT_PERIODIC_GAIN: {
    spellId: [SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id, TALENTS.FERAL_SPIRIT_TALENT.id],
    spellIdOverride: TALENTS.FERAL_SPIRIT_TALENT.id,
    linkFromEventType: [EventType.ResourceChange],
    linkToEventType: GAIN_EVENT_TYPES,
    forwardBufferMs: BufferMs.Ticks,
    backwardsBufferMs: BufferMs.Ticks,
    searchDirection: SearchDirection.ForwardsFirst,
    maximum: 1,
    requiresExact: true,
    updateExistingEvent: true,
  },
  // Melee weapon attacks have a lower priority than other cast and special interaction damage events
  STORMSTRIKE: {
    spellId: [
      SPELLS.STORMSTRIKE_DAMAGE.id,
      SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id,
      SPELLS.WINDSTRIKE_DAMAGE.id,
      SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id,
    ],
    spellIdOverride: SPELLS.STORMSTRIKE_CAST.id,
    forwardBufferMs: BufferMs.Damage,
    linkFromEventType: EventType.Damage,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  ICE_STRIKE: {
    spellId: [
      TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
      TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
    ],
    linkFromEventType: EventType.Cast,
    enabled: (c: Combatant) =>
      c.hasTalent(TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT) ||
      c.hasTalent(TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT),
    forwardBufferMs: BufferMs.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  MELEE_WEAPON_ATTACK: {
    // anything classified as a melee hit goes here
    spellId: [
      TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id,
      TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id,
      TALENTS.LAVA_LASH_TALENT.id,
      TALENTS.CRASH_LIGHTNING_TALENT.id,
      SPELLS.CRASH_LIGHTNING_BUFF.id,
      TALENTS.DOOM_WINDS_TALENT.id,
      TALENTS.SUNDERING_TALENT.id,
      SPELLS.WINDFURY_ATTACK.id,
      SPELLS.MELEE.id,
      SPELLS.WINDLASH.id,
      SPELLS.WINDLASH_OFFHAND.id,
    ],
    spellIdOverride: [
      {
        replaceWithSpellId: SPELLS.MELEE.id,
        spellId: [SPELLS.WINDLASH.id, SPELLS.WINDLASH_OFFHAND.id],
      },
      {
        replaceWithSpellId: TALENTS.CRASH_LIGHTNING_TALENT.id,
        spellId: SPELLS.CRASH_LIGHTNING_BUFF.id,
      },
    ],
    forwardBufferMs: BufferMs.Damage,
    backwardsBufferMs: BufferMs.MinimumDamageBuffer,
    linkFromEventType: EventType.Damage,
    minimumBuffer: BufferMs.MinimumDamageBuffer,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  UNKNOWN: {
    spellId: SPELLS.MAELSTROM_WEAPON_BUFF.id,
    forwardBufferMs: 0,
    backwardsBufferMs: BufferMs.Disabled,
    linkToEventType: GAIN_EVENT_TYPES,
    linkFromEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
  },
};

export const MAELSTROM_SPENDER_SPELLIDS =
  typeof MAELSTROM_ABILITIES.SPENDERS.spellId === 'number'
    ? [MAELSTROM_ABILITIES.SPENDERS.spellId]
    : MAELSTROM_ABILITIES.SPENDERS.spellId;

/**
 * Specification of periodic gain effects.
 */
export const PERIODIC_SPELLS: PeriodicGainEffect[] = [
  {
    spellId: SPELLS.FERAL_SPIRIT_MAELSTROM_BUFF.id,
    frequencyMs: 3000,
    spellIdOverride: TALENTS.FERAL_SPIRIT_TALENT.id,
  },
  {
    spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
    frequencyMs: 1000,
    spellIdOverride: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
  },
];
