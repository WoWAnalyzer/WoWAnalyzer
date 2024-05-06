import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';

export const STORMSTRIKE_CAST_SPELLS = [TALENTS.STORMSTRIKE_TALENT, SPELLS.WINDSTRIKE_CAST];

export const STORMSTRIKE_DAMAGE_SPELLS = [
  SPELLS.STORMSTRIKE_DAMAGE,
  SPELLS.STORMSTRIKE_DAMAGE_OFFHAND,
  SPELLS.WINDSTRIKE_DAMAGE,
  SPELLS.WINDSTRIKE_DAMAGE_OFFHAND,
];

export const MOLTEN_ASSAULT_SCALING = [0, 3, 6];

export const MERGE_SPELLS = [
  {
    SpellIds: [SPELLS.MELEE.id, SPELLS.WINDLASH.id, SPELLS.WINDLASH_OFFHAND.id],
    NewSpell: SPELLS.MELEE.id,
  },
  {
    SpellIds: [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id],
    NewSpell: TALENTS.STORMSTRIKE_TALENT.id,
  },
  {
    SpellIds: [SPELLS.WINDSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id],
    NewSpell: SPELLS.WINDSTRIKE_CAST.id,
  },
];

export const MAELSTROM_WEAPON_ELIGIBLE_SPELLS: Spell[] = [
  SPELLS.ELEMENTAL_BLAST,
  SPELLS.LIGHTNING_BOLT,
  TALENTS.LAVA_BURST_TALENT,
  SPELLS.LAVA_BURST_DAMAGE,
  TALENTS.CHAIN_LIGHTNING_TALENT,
  TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT, //Intentional usage of Elemental Shaman spell id
  TALENTS.CHAIN_HEAL_TALENT,
  SPELLS.HEALING_SURGE,
];

//* maximum difference found so far is 45ms, so setting to 50 for a little wiggle room */
export const MAELSTROM_WEAPON_MS = 50;
