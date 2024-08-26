/**
 * All Classic Druid spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  BARKSKIN: {
    id: 22812,
    name: 'Barkskin',
    icon: 'spell_nature_stoneclawtotem.jpg',
  },
  BASH: {
    id: 5211,
    name: 'Bash',
    icon: 'ability_druid_bash.jpg',
  },
  BEAR_FORM: {
    id: 5487,
    name: 'Bear Form',
    icon: 'ability_racial_bearform.jpg',
  },
  CAT_FORM: {
    id: 768,
    name: 'Cat Form',
    icon: 'ability_druid_catform.jpg',
  },
  CHALLENGING_ROAR: {
    id: 5209,
    name: 'Challenging Roar',
    icon: 'ability_druid_challangingroar.jpg',
  },
  CLAW: {
    id: 1082,
    name: 'Claw',
    icon: 'ability_druid_rake.jpg',
  },
  COWER: {
    id: 8998,
    name: 'Cower',
    icon: 'ability_druid_cower.jpg',
  },
  CYCLONE: {
    id: 33786,
    name: 'Cyclone',
    icon: 'spell_nature_earthbind.jpg',
  },
  DASH: {
    id: 1850,
    name: 'Dash',
    icon: 'ability_druid_dash.jpg',
  },
  DEMORALIZING_ROAR: {
    id: 99,
    name: 'Demoralizing Roar',
    icon: 'classic_ability_druid_demoralizingroar.jpg',
  },
  ENRAGE: {
    id: 5229,
    name: 'Enrage',
    icon: 'ability_druid_enrage.jpg',
  },
  ENTANGLING_ROOTS: {
    id: 339,
    name: 'Entangling Roots',
    icon: 'spell_nature_stranglevines.jpg',
  },
  FAERIE_FIRE: {
    id: 770,
    name: 'Faerie Fire',
    icon: 'spell_nature_faeriefire.jpg',
  },
  FAERIE_FIRE_FERAL: {
    id: 16857,
    name: 'Faerie Fire (Feral)',
    icon: 'spell_nature_faeriefire.jpg',
  },
  FEROCIOUS_BITE: {
    id: 22568,
    name: 'Ferocious Bite',
    icon: 'ability_druid_ferociousbite.jpg',
  },
  FRENZIED_REGENERATION: {
    id: 22842,
    name: 'Frenzied Regeneration',
    icon: 'ability_bullrush.jpg',
  },
  GROWL: {
    id: 6795,
    name: 'Growl',
    icon: 'ability_physical_taunt.jpg',
  },
  HEALING_TOUCH: {
    id: 5185,
    name: 'Healing Touch',
    icon: 'spell_nature_healingtouch.jpg',
  },
  HIBERNATE: {
    id: 2637,
    name: 'Hibernate',
    icon: 'spell_nature_sleep.jpg',
  },
  HURRICANE: {
    id: 16914,
    name: 'Hurricane',
    icon: 'spell_nature_cyclone.jpg',
  },
  INNERVATE: {
    id: 29166,
    name: 'Innervate',
    icon: 'spell_nature_lightning.jpg',
  },
  INSECT_SWARM: {
    id: 5570,
    name: 'Insect Swarm',
    icon: 'spell_nature_insectswarm.jpg',
  },
  LACERATE: {
    id: 33745,
    name: 'Lacerate',
    icon: 'ability_druid_lacerate.jpg',
  },
  LIFEBLOOM: {
    id: 33763,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom.jpg',
  },
  LIFEBLOOM_HEAL: {
    id: 33778,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom.jpg',
  },
  LIFEBLOOM_REGEN: {
    id: 64372,
    name: 'Lifebloom',
    icon: 'spell_nature_healingtouch.jpg',
  },
  MAIM: {
    id: 22570,
    name: 'Maim',
    icon: 'ability_druid_mangle-tga.jpg',
  },
  MARK_OF_THE_WILD: {
    id: 1126,
    name: 'Mark of the Wild',
    icon: 'spell_nature_regeneration.jpg',
  },
  MAUL: {
    id: 6807,
    name: 'Maul',
    icon: 'ability_druid_maul.jpg',
  },
  MOONFIRE: {
    id: 8921,
    name: 'Moonfire',
    icon: 'spell_nature_starfall.jpg',
  },
  NATURES_GRASP: {
    id: 16689,
    name: "Nature's Grasp",
    icon: 'spell_nature_natureswrath.jpg',
  },
  NOURISH: {
    id: 50464,
    name: 'Nourish',
    icon: 'ability_druid_nourish.jpg',
  },
  POUNCE: {
    id: 9005,
    name: 'Pounce',
    icon: 'ability_druid_supriseattack.jpg',
  },
  PROWL: {
    id: 5215,
    name: 'Prowl',
    icon: 'ability_druid_prowl.jpg',
  },
  RAKE: {
    id: 1822,
    name: 'Rake',
    icon: 'ability_druid_disembowel.jpg',
  },
  RAVAGE: {
    id: 6785,
    name: 'Ravage',
    icon: 'ability_druid_ravage.jpg',
  },
  RAVAGE_STAMPEDE: {
    id: 81170,
    name: 'Ravage!',
    icon: 'ability_druid_ravage.jpg',
  },
  REBIRTH: {
    id: 20484,
    name: 'Rebirth',
    icon: 'spell_nature_reincarnation.jpg',
  },
  REGROWTH: {
    id: 8936,
    name: 'Regrowth',
    icon: 'spell_nature_resistnature.jpg',
  },
  REJUVENATION: {
    id: 774,
    name: 'Rejuvenation',
    icon: 'spell_nature_rejuvenation.jpg',
  },
  REMOVE_CORRUPTION: {
    id: 2782,
    name: 'Remove Corruption',
    icon: 'spell_holy_removecurse.jpg',
  },
  RIP: {
    id: 1079,
    name: 'Rip',
    icon: 'ability_ghoulfrenzy.jpg',
  },
  SAVAGE_ROAR: {
    id: 52610,
    name: 'Savage Roar',
    icon: 'ability_druid_skinteeth.jpg',
  },
  SHRED: {
    id: 5221,
    name: 'Shred',
    icon: 'spell_shadow_vampiricaura.jpg',
  },
  SKULL_BASH_BEAR: {
    id: 80964,
    name: 'Skull Bash',
    icon: 'inv_misc_bone_taurenskull_01.jpg',
  },
  SKULL_BASH_CAT: {
    id: 80965,
    name: 'Skull Bash',
    icon: 'inv_bone_skull_04.jpg',
  },
  SOOTHE: {
    id: 2908,
    name: 'Soothe',
    icon: 'ability_hunter_beastsoothe.jpg',
  },
  STAMPEDING_ROAR_BEAR: {
    id: 77761,
    name: 'Stampeding Roar',
    icon: 'spell_druid_stamedingroar.jpg',
  },
  STAMPEDING_ROAR_CAT: {
    id: 77764,
    name: 'Stampeding Roar',
    icon: 'spell_druid_stampedingroar_cat.jpg',
  },
  STARFIRE: {
    id: 2912,
    name: 'Starfire',
    icon: 'spell_arcane_starfire.jpg',
  },
  SWIPE_BEAR: {
    id: 779,
    name: 'Swipe',
    icon: 'inv_misc_monsterclaw_03.jpg',
  },
  SWIPE_CAT: {
    id: 62078,
    name: 'Swipe',
    icon: 'inv_misc_monsterclaw_03.jpg',
  },
  THORNS: {
    id: 467,
    name: 'Thorns',
    icon: 'spell_nature_thorns.jpg',
  },
  THRASH: {
    id: 77758,
    name: 'Thrash',
    icon: 'spell_druid_thrash.jpg',
  },
  TIGERS_FURY: {
    id: 5217,
    name: "Tiger's Fury",
    icon: 'ability_mount_jungletiger.jpg',
  },
  TRANQUILITY: {
    id: 740,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility.jpg',
  },
  TRANQUILITY_HEAL: {
    id: 44203,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility.jpg',
  },
  WILD_MUSHROOM: {
    id: 88747,
    name: 'Wild Mushroom',
    icon: 'druid_ability_wildmushroom_a.jpg',
  },
  WILD_MUSHROOM_DETONATE: {
    id: 88751,
    name: 'Wild Mushroom: Detonate',
    icon: 'druid_ability_wildmushroom_b.jpg',
  },
  WRATH: {
    id: 5176,
    name: 'Wrath',
    icon: 'spell_nature_wrathv2.jpg',
  },

  // ---------
  // TALENTS
  // ---------
  // Balance
  EARTH_AND_MOON: {
    id: 60433,
    name: 'Earth and Moon',
    icon: 'ability_druid_earthandsky.jpg',
  },
  ECLIPSE_SOLAR: {
    id: 48517,
    name: 'Eclipse (Solar)',
    icon: 'ability_druid_eclipseorange.jpg',
  },
  ECLIPSE_LUNAR: {
    id: 48518,
    name: 'Eclipse (Lunar)',
    icon: 'ability_druid_eclipse.jpg',
  },
  FORCE_OF_NATURE: {
    id: 33831,
    name: 'Force of Nature',
    icon: 'ability_druid_forceofnature.jpg',
  },
  MOONKIN_AURA: {
    id: 24907,
    name: 'Moonkin Aura',
    icon: 'spell_nature_moonglow.jpg',
  },
  MOONKIN_FORM: {
    id: 24858,
    name: 'Moonkin Form',
    icon: 'spell_nature_forceofnature.jpg',
  },
  NATURES_GRACE_BUFF: {
    id: 16886,
    name: "Nature's Grace",
    icon: 'spell_nature_naturesblessing.jpg',
  },
  SHOOTING_STARS: {
    id: 93400,
    name: 'Shooting Stars',
    icon: 'ability_mage_arcanebarrage.jpg',
  },
  SOLAR_BEAM: {
    id: 78675,
    name: 'Solar Beam',
    icon: 'ability_vehicle_sonicshockwave.jpg',
  },
  STARFALL: {
    id: 48505,
    name: 'Starfall',
    icon: 'ability_druid_starfall.jpg',
  },
  STARSURGE: {
    id: 78674,
    name: 'Starsurge',
    icon: 'spell_arcane_arcane03.jpg',
  },
  SUNFIRE: {
    id: 93402,
    name: 'Sunfire',
    icon: 'ability_mage_firestarter.jpg',
  },
  TYPHOON: {
    id: 61391,
    name: 'Typhoon',
    icon: 'ability_druid_typhoon.jpg',
  },
  // Feral Combat
  BERSERK: {
    id: 50334,
    name: 'Berserk',
    icon: 'ability_druid_berserk.jpg',
  },
  FERAL_CHARGE_BEAR: {
    id: 16979,
    name: 'Feral Charge - Bear',
    icon: 'ability_hunter_pet_bear.jpg',
  },
  FERAL_CHARGE_CAT: {
    id: 49376,
    name: 'Feral Charge - Cat',
    icon: 'spell_druid_feralchargecat.jpg',
  },
  LEADER_OF_THE_PACK: {
    id: 24932,
    name: 'Leader of the Pack',
    icon: 'spell_nature_unyeildingstamina.jpg',
  },
  MANGLE_BEAR: {
    id: 33878,
    name: 'Mangle',
    icon: 'ability_druid_mangle2.jpg',
  },
  MANGLE_CAT: {
    id: 33876,
    name: 'Mangle',
    icon: 'ability_druid_mangle2.jpg',
  },
  PRIMAL_FURY: {
    id: 37117,
    name: 'Primal Fury',
    icon: 'ability_racial_cannibalize.jpg',
  },
  PULVERIZE: {
    id: 80313,
    name: 'Pulverize',
    icon: 'ability_smash.jpg',
  },
  SURVIVAL_INSTINCTS: {
    id: 61336,
    name: 'Survival Instincts',
    icon: 'ability_druid_tigersroar.jpg',
  },
  // Restoration
  CLEARCASTING: {
    id: 16870,
    name: 'Clearcasting',
    icon: 'spell_shadow_manaburn.jpg',
  },
  NATURES_SWIFTNESS_DRUID: {
    id: 17116,
    name: "Nature's Swiftness",
    icon: 'spell_nature_ravenform.jpg',
  },
  REVITALIZE_ENERGY: {
    // Removed in Cata?
    id: 48540,
    name: 'Revitalize',
    icon: 'ability_druid_replenish',
  },
  REVITALIZE_MANA: {
    id: 81094,
    name: 'Revitalize',
    icon: 'ability_druid_replenish.jpg',
  },
  REVITALIZE_RAGE: {
    // Removed in Cata?
    id: 48541,
    name: 'Revitalize',
    icon: 'ability_druid_replenish',
  },
  REVITALIZE_RUNIC_POWER: {
    // Removed in Cata?
    id: 48543,
    name: 'Revitalize',
    icon: 'ability_druid_replenish',
  },
  SWIFTMEND: {
    id: 18562,
    name: 'Swiftmend',
    icon: 'inv_relics_idolofrejuvenation.jpg',
  },
  TREE_OF_LIFE: {
    id: 33891,
    name: 'Tree of Life',
    icon: 'ability_druid_treeoflife.jpg',
  },
  WILD_GROWTH: {
    id: 48438,
    name: 'Wild Growth',
    icon: 'ability_druid_flourish.jpg',
  },
  // ---------
  // GLYPHS
  // ---------
  GLYPH_OF_SWIFTMEND: {
    id: 54864,
    name: 'Glyph of Swiftmend',
    icon: 'inv_relics_idolofrejuvenation.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
