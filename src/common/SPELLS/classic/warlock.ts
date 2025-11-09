/**
 * Classic Warlock spells (including talent spells) NOT included in generated spell lists go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // Pet casts
  DOOM_BOLT: {
    // Doomguard
    id: 85692,
    name: 'Doom Bolt',
    icon: 'spell_shadow_shadowbolt.jpg',
  },
  FELSTORM: {
    // Felguard
    id: 119914,
    name: 'Felstorm',
    icon: 'ability_warrior_bladestorm.jpg',
  },
  OPTICAL_BLAST: {
    // Observer
    id: 119911,
    name: 'Optical Blast',
    icon: 'spell_nature_elementalprecision_1.jpg',
  },
  SHADOW_BULWARK: {
    // Voidwalker
    id: 132413,
    name: 'Shadow Bulwark',
    icon: 'spell_shadow_antishadow.jpg',
  },
  // Spells
  DEMONIC_CIRCLE_SUMMON: {
    id: 48018,
    name: 'Demonic Circle: Summon',
    icon: 'spell_shadow_demoniccirclesummon.jpg',
  },
  SOUL_SWAP_EXHALE: {
    id: 86213,
    name: 'Soul Swap Exhale',
    icon: 'ability_rogue_envelopingshadows.jpg',
  },
  // Talents
  GRIMOIRE_OF_SACRIFICE: {
    id: 108503,
    name: 'Grimoire of Sacrifice',
    icon: 'warlock_grimoireofsacrifice.jpg',
  },
  SHADOWFURY: {
    id: 30283,
    name: 'Shadowfury',
    icon: 'ability_warlock_shadowfurytga.jpg',
  },
  // Casts that aren't casts
  CORRUPTION_TICK: {
    id: 146739,
    name: 'Corruption',
    icon: 'spell_shadow_abominationexplosion.jpg',
  },
  RAIN_OF_FIRE_DAMAGE: {
    id: 42223,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire.jpg',
  },
  SHADOW_TRANCE: {
    id: 17941,
    name: 'Shadow Trance',
    icon: 'spell_shadow_twilight.jpg',
  },
  // Channeling Spells
  DRAIN_LIFE: {
    id: 689,
    name: 'Drain Life',
    icon: 'spell_shadow_lifedrain02.jpg',
  },
  DRAIN_SOUL: {
    id: 1120,
    name: 'Drain Soul',
    icon: 'spell_shadow_haunting.jpg',
  },
  RAIN_OF_FIRE: {
    id: 5740,
    name: 'Rain of Fire',
    icon: 'spell_shadow_rainoffire.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
