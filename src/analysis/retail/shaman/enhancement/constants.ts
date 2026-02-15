import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';

export const STORMSTRIKE_CAST_SPELLS = [SPELLS.STORMSTRIKE, SPELLS.WINDSTRIKE_CAST];

export const STORMSTRIKE_DAMAGE_SPELLS = [
  SPELLS.STORMSTRIKE_DAMAGE,
  SPELLS.STORMSTRIKE_DAMAGE_OFFHAND,
  SPELLS.WINDSTRIKE_DAMAGE,
  SPELLS.WINDSTRIKE_DAMAGE_OFFHAND,
];

export const STORMSTRIKE_SPELL_IDS = STORMSTRIKE_CAST_SPELLS.map((spell) => spell.id);
export const STORMSTRIKE_DAMAGE_IDS = STORMSTRIKE_DAMAGE_SPELLS.map((spell) => spell.id);

export const MERGE_SPELLS: { spellIds: number[]; mergeInto: number }[] = [
  {
    spellIds: [SPELLS.MELEE.id, SPELLS.WINDLASH.id, SPELLS.WINDLASH_OFFHAND.id],
    mergeInto: SPELLS.MELEE.id,
  },
  {
    spellIds: [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id],
    mergeInto: SPELLS.STORMSTRIKE.id,
  },
  {
    spellIds: [SPELLS.WINDSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id],
    mergeInto: SPELLS.WINDSTRIKE_CAST.id,
  },
  {
    spellIds: [TALENTS.SUNDERING_TALENT.id, SPELLS.SUNDERING_EARTHSURGE.id],
    mergeInto: TALENTS.SUNDERING_TALENT.id,
  },
  {
    spellIds: [
      SPELLS.PRIMORDIAL_FIRE.id,
      SPELLS.PRIMORDIAL_LIGHTNING.id,
      SPELLS.PRIMORDIAL_FROST.id,
    ],
    mergeInto: SPELLS.PRIMORDIAL_STORM_CAST.id,
  },
];

export const MAELSTROM_WEAPON_ELIGIBLE_SPELLS: Spell[] = [
  SPELLS.LIGHTNING_BOLT,
  TALENTS.CHAIN_LIGHTNING_TALENT,
  SPELLS.TEMPEST_CAST,
  SPELLS.PRIMORDIAL_STORM_CAST,
  SPELLS.PRIMORDIAL_FIRE,
  SPELLS.PRIMORDIAL_LIGHTNING,
  SPELLS.PRIMORDIAL_FROST,
];

export const MAELSTROM_WEAPON_ELIGIBLE_SPELL_IDS = MAELSTROM_WEAPON_ELIGIBLE_SPELLS.map(
  (spell) => spell.id,
);

export enum EventLinkBuffers {
  MaelstromWeapon = 50,
  PrimordialWave = 15500,
  Stormstrike = 900,
  StormUnleashed = 5,
  CastDamageBuffer = 100,
  SURGING_ELEMENTS_BUFFER = 250,
  LIGHTNING_BOLT_BUFFER = 150,
  PRIMORDIAL_WAVE_DAMAGE_BUFFER = 500,
}

export enum EnhancementEventLinks {
  THORIMS_INVOCATION_LINK = 'thorims-invocation',
  THORIMS_INVOCATION_DAMAGE_LINK = 'thorims-invocation-damage',
  STORMSTRIKE_LINK = 'stormstrike',
  CHAIN_LIGHTNING_LINK = 'chain-lightning',
  TEMPEST_LINK = 'tempest',
  MAELSTROM_SPENDER_LINK = 'maelstrom-spender',
  LIGHTNING_BOLT_LINK = 'lightning-bolt',
  MAELSTROM_GENERATOR_LINK = 'maelstrom-generator',
  CRASH_LIGHTNING_LINK = 'crash-lightning',
  STORM_UNLEASHED_LINK = 'storm-unleashed',
  SUNDERING_LINK = 'sundering',
  REACTIVITY_LINK = 'reactivity',
  WHIRLING_FIRE_LINK = 'whirling-fire',
}

export const GCD_TOLERANCE = 25;
