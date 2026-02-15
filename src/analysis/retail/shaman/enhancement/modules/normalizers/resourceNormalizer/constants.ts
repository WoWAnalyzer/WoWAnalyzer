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
  [TALENTS.THUNDER_CAPACITOR_TALENT.id]: 10,
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
    ],
    type: MaelstromAbilityType.Spender,
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.Damage,
    backwardsBufferMs: BufferMs.SpendBackward,
    linkToEventType: SPEND_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
  },
  STATIC_ACCUMULATION: {
    spellId: TALENTS.STATIC_ACCUMULATION_TALENT.id,
    linkFromEventType: [EventType.ResourceChange, ...GAIN_EVENT_TYPES],
    linkToEventType: GAIN_EVENT_TYPES,
    forwardBufferMs: BufferMs.Ticks * 2,
    backwardsBufferMs: BufferMs.Ticks,
    searchDirection: SearchDirection.ForwardsFirst,
    matchMode: MatchMode.MatchLast,
    maximum: 2,
    requiresExact: true,
    updateExistingEvent: true,
  },
  SUPERCHARGE: {
    spellId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id, SPELLS.TEMPEST_CAST.id],
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
  THUNDER_CAPACITOR: {
    spellId: [SPELLS.LIGHTNING_BOLT.id, TALENTS.CHAIN_LIGHTNING_TALENT.id, SPELLS.TEMPEST_CAST.id],
    type: MaelstromAbilityType.Builder,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.THUNDER_CAPACITOR_TALENT),
    maximum: (c: Combatant) => (c.hasTalent(TALENTS.OVERFLOWING_MAELSTROM_TALENT) ? 10 : 5),
    linkFromEventType: [EventType.Cast, EventType.FreeCast],
    forwardBufferMs: BufferMs.StaticAccumulation,
    spellIdOverride: TALENTS.THUNDER_CAPACITOR_TALENT.id,
    minimumBuffer: 50,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  VOLTAIC_BLAZE: {
    spellId: SPELLS.VOLTAIC_BLAZE_CAST.id,
    linkFromEventType: EventType.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsFirst,
    maximum: (c: Combatant) => (c.hasTalent(TALENTS.FIRE_NOVA_TALENT) ? 3 : 1),
    forwardBufferMs: 0,
    backwardsBufferMs: BufferMs.Cast,
    requiresExact: true,
  },
  ELEMENTAL_ASSAULT: {
    spellId: [SPELLS.STORMSTRIKE.id, SPELLS.WINDSTRIKE_CAST.id, TALENTS.LAVA_LASH_TALENT.id],
    linkFromEventType: EventType.Cast,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT),
    spellIdOverride: TALENTS.ELEMENTAL_ASSAULT_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  LIGHTNING_STRIKES: {
    spellId: [SPELLS.STORMSTRIKE.id, SPELLS.WINDSTRIKE_CAST.id, TALENTS.LAVA_LASH_TALENT.id],
    linkFromEventType: EventType.Cast,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.LIGHTNING_STRIKES_TALENT),
    spellIdOverride: TALENTS.LIGHTNING_STRIKES_TALENT.id,
    forwardBufferMs: BufferMs.Cast,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  SURGING_ELEMENTS_TALENT: {
    spellId: TALENTS.SUNDERING_TALENT.id,
    enabled: (c: Combatant) => c.hasTalent(TALENTS.SURGING_ELEMENTS_TALENT),
    linkFromEventType: EventType.Cast,
    forwardBufferMs: BufferMs.OnSameTimestamp,
    backwardsBufferMs: BufferMs.SurgingElements,
    spellIdOverride: TALENTS.SURGING_ELEMENTS_TALENT.id,
    maximum: 5,
    requiresExact: true,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.BackwardsOnly,
    matchMode: MatchMode.MatchLast,
  },
  // Melee weapon attacks have a lower priority than other cast and special interaction damage events
  STORMSTRIKE: {
    spellId: [
      SPELLS.STORMSTRIKE_DAMAGE.id,
      SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id,
      SPELLS.WINDSTRIKE_DAMAGE.id,
      SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id,
    ],
    spellIdOverride: SPELLS.STORMSTRIKE.id,
    forwardBufferMs: BufferMs.Damage,
    linkFromEventType: EventType.Damage,
    linkToEventType: GAIN_EVENT_TYPES,
    searchDirection: SearchDirection.ForwardsOnly,
    matchMode: MatchMode.MatchFirst,
  },
  MELEE_WEAPON_ATTACK: {
    // anything classified as a melee hit goes here
    spellId: [
      TALENTS.LAVA_LASH_TALENT.id,
      TALENTS.CRASH_LIGHTNING_TALENT.id,
      SPELLS.CRASH_LIGHTNING_BUFF_DAMAGE.id,
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
        spellId: SPELLS.CRASH_LIGHTNING_BUFF_DAMAGE.id,
      },
    ],
    forwardBufferMs: BufferMs.Damage,
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
    spellId: SPELLS.DOOM_WINDS_BUFF.id,
    frequencyMs: 1000,
    spellIdOverride: TALENTS.STATIC_ACCUMULATION_TALENT.id,
  },
  {
    spellId: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
    frequencyMs: 1000,
    spellIdOverride: TALENTS.STATIC_ACCUMULATION_TALENT.id,
  },
];
