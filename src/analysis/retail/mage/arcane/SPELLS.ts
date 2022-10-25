/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from 'common/SPELLS/Spell';

const spells = spellIndexableList({
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
  GREATER_INVISIBILITY: {
    id: 110959,
    name: 'Greater Invisibility',
    icon: 'ability_mage_greaterinvisibility',
  },
  MASTERY_SAVANT: {
    id: 190740,
    name: 'Mastery: Savant',
    icon: 'spell_arcane_manatap',
  },
  PRISMATIC_BARRIER: {
    id: 235450,
    name: 'Prismatic Barrier',
    icon: 'spell_magearmor',
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
});

export default spells;
