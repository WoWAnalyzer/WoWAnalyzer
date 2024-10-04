/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from 'common/SPELLS/Spell';

const spells = {
  ARCANE_BARRAGE: {
    id: 44425,
    name: 'Arcane Barrage',
    icon: 'ability_mage_arcanebarrage',
  },
  ARCANE_BARRAGE_ENERGIZE: {
    id: 321529,
    name: 'Arcane Barrage',
    icon: 'ability_mage_arcanebarrage',
  },
  ARCANE_BLAST: {
    id: 30451,
    name: 'Arcane Blast',
    icon: 'spell_arcane_blast',
  },
  ARCANE_MISSILES_DAMAGE: {
    id: 7268,
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall',
  },
  ARCANE_MISSILES_BUFF: {
    id: 79683,
    name: 'Arcane Missiles!',
    icon: 'spell_nature_starfall',
  },
  ARCANE_MISSILES_ENERGIZE: {
    id: 208030,
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall',
  },
  ARCANE_EXPLOSION: {
    id: 1449,
    name: 'Arcane Explosion',
    icon: 'spell_nature_wispsplode',
  },
  TOUCH_OF_THE_MAGI_DEBUFF: {
    id: 210824,
    name: 'Touch of the Magi',
    icon: 'spell_mage_icenova',
  },
  ARCANE_FAMILIAR_BUFF: {
    id: 210126,
    name: 'Arcane Familiar',
    icon: 'ability_sorcererking_arcanemines',
  },
  CLEARCASTING_ARCANE: {
    id: 263725,
    name: 'Clearcasting',
    icon: 'spell_shadow_manaburn',
  },
  RULE_OF_THREES_BUFF: {
    id: 264774,
    name: 'Rule of Threes',
    icon: 'spell_arcane_starfire',
  },
  MASTERY_SAVANT: {
    id: 190740,
    name: 'Mastery: Savant',
    icon: 'spell_arcane_manatap',
  },
  REPLENISH_MANA: {
    id: 5405,
    name: 'Replenish Mana',
    icon: 'inv_misc_gem_sapphire_02',
  },
  ARCANE_CHARGE: {
    id: 36032,
    name: 'Arcane Charge',
    icon: 'spell_arcane_arcane01',
  },
  ARCANE_ORB_DAMAGE: {
    id: 153640,
    name: 'Arcane Orb',
    icon: 'spell_mage_arcaneorb',
  },
  ARCANE_SURGE_BUFF: {
    id: 365362,
    name: 'Arcane Surge',
    icon: 'ability_mage_arcanesurge',
  },
  ARCANE_HARMONY_BUFF: {
    id: 384455,
    name: 'Arcane Harmony',
    icon: 'ability_creature_cursed_04',
  },
  SIPHON_STORM_BUFF: {
    id: 384267,
    name: 'Siphon Storm',
    icon: 'ability_monk_forcesphere_arcane',
  },
  NETHER_PRECISION_BUFF: {
    id: 383783,
    name: 'Nether Precision',
    icon: 'spell_arcane_blast_nightborne',
  },
  ARCANE_TEMPO_BUFF: {
    id: 383997,
    name: 'Arcane Tempo',
    icon: 'ability_socererking_arcaneacceleration',
  },
  ARCANE_ECHO_DAMAGE: {
    id: 342232,
    name: 'Arcane Echo',
    icon: 'ability_socererking_arcanewrath',
  },
  AETHER_ATTUNEMENT_PROC_BUFF: {
    id: 453601,
    name: 'Aether Attunement',
    icon: 'inv_enchant_essencearcanelarge',
  },
  AETHER_ATTUNEMENT_STACK_BUFF: {
    id: 458388,
    name: 'Aether Attunement',
    icon: 'spell_nature_starfall',
  },
  ARCANE_SOUL_BUFF: {
    id: 451038,
    name: 'Arcane Soul',
    icon: 'inv_soulbarrier',
  },
  INTUITION_BUFF: {
    id: 455681,
    name: 'Intuition',
    icon: 'spell_shadow_brainwash',
  },
} satisfies Record<string, Spell>;

export default spells;
