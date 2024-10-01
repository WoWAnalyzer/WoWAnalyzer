/**
 * All Druid abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  /////////////////////////////////////////////////////////////////////////////
  // SHARED
  //
  HIBERNATE: {
    id: 2637,
    name: 'Hibernate',
    icon: 'spell_nature_sleep',
  },
  SOOTHE: {
    id: 2908,
    name: 'Soothe',
    icon: 'ability_hunter_beastsoothe',
  },
  REVIVE: {
    id: 50769,
    name: 'Revive',
    icon: 'ability_druid_lunarguidance',
  },
  TYPHOON: {
    id: 61391,
    name: 'Typhoon',
    icon: 'ability_druid_typhoon',
  },
  // learnt from a tome, treant form is (mostly?) functionally identical to caster form
  TREANT_FORM: {
    id: 114282,
    name: 'Treant Form',
    icon: 'ability_druid_treeoflife',
  },
  // learnt from a tome
  CHARM_WOODLAND_CREATURE: {
    id: 127757,
    name: 'Charm Woodland Creature',
    icon: 'inv_misc_rabbit',
  },
  TELEPORT_MOONGLADE: {
    id: 18960,
    name: 'Teleport: Moonglade',
    icon: 'spell_arcane_teleportmoonglade',
  },
  TELEPORT_DREAMWALK: {
    id: 193753,
    name: 'Dreamwalk',
    icon: 'spell_arcane_teleportstormwind',
  },
  // passive for all Feral druids and any druid with Feral Affinity
  FELINE_SWIFTNESS: {
    id: 131768,
    name: 'Feline Swiftness',
    icon: 'spell_druid_tirelesspursuit',
  },
  // learnt from a tome, requires moonkin form to use
  FLAP: {
    id: 164862,
    name: 'Flap',
    icon: 'inv_feather_12',
  },
  // the action of wild charging
  WILD_CHARGE_TALENT: {
    id: 102401,
    name: 'Wild Charge',
    icon: 'spell_druid_wildcharge',
  },
  WILD_CHARGE_MOONKIN: {
    id: 102383,
    name: 'Wild Charge',
    icon: 'ability_druid_owlkinfrenzy',
  },
  WILD_CHARGE_CAT: {
    id: 49376,
    name: 'Wild Charge',
    icon: 'spell_druid_feralchargecat',
  },
  WILD_CHARGE_BEAR: {
    id: 16979,
    name: 'Wild Charge',
    icon: 'ability_hunter_pet_bear',
  },
  WILD_CHARGE_TRAVEL: {
    id: 102417,
    name: 'Wild Charge',
    icon: 'trade_archaeology_antleredcloakclasp',
  },
  HEART_OF_THE_WILD_BALANCE_AFFINITY: {
    id: 108291,
    name: 'Heart of the Wild',
    icon: 'spell_holy_blessingofagility',
  },
  HEART_OF_THE_WILD_FERAL_AFFINITY: {
    id: 108292,
    name: 'Heart of the Wild',
    icon: 'spell_holy_blessingofagility',
  },
  HEART_OF_THE_WILD_GUARDIAN_AFFINITY: {
    id: 108293,
    name: 'Heart of the Wild',
    icon: 'spell_holy_blessingofagility',
  },
  HEART_OF_THE_WILD_RESTO_AFFINITY: {
    id: 108294,
    name: 'Heart of the Wild',
    icon: 'spell_holy_blessingofagility',
  },
  CONVOKE_SPIRITS: {
    // this is the ID for each spec's talent as well - this ID is used for the Cast and the Buff
    id: 391528,
    name: 'Convoke the Spirits',
    icon: 'ability_ardenweald_druid',
  },
  // cast from Adaptive Swarm talent
  ADAPTIVE_SWARM: {
    id: 391888,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  // heal and buff from Adaptive Swarm talent
  ADAPTIVE_SWARM_HEAL: {
    id: 391891,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  // damage and debuff from Adaptive Swarm talent
  ADAPTIVE_SWARM_DAMAGE: {
    id: 391889,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  //The moonkin form granted by Balance Affinity
  MOONKIN_FORM_AFFINITY: {
    id: 197625,
    name: 'Moonkin Form',
    icon: 'spell_nature_forceofnature',
  },
  // granted by Balance Affinity to non-Balance druids
  STARSURGE_AFFINITY: {
    id: 197626,
    name: 'Starsurge',
    icon: 'spell_arcane_arcane03',
  },
  // granted by Balance Affinity to non-Balance druids
  STARFIRE_AFFINITY: {
    id: 197628,
    name: 'Starfire',
    icon: 'spell_arcane_starfire',
  },
  // granted by Balance Affinity to Guardian and Feral druids
  SUNFIRE_AFFINITY: {
    id: 197630,
    name: 'Sunfire',
    icon: 'ability_mage_firestarter',
  },
  FRENZIED_REGENERATION: {
    id: 22842,
    name: 'Frenzied Regeneration',
    icon: 'ability_bullrush',
  },
  INCARNATION_CHOSEN_OF_ELUNE: {
    id: 102560,
    name: 'Incarnation: Chosen of Elune',
    icon: 'spell_druid_incarnation',
  },
  BEAR_FORM: {
    id: 5487,
    name: 'Bear Form',
    icon: 'ability_racial_bearform',
  },
  CAT_FORM: {
    id: 768,
    name: 'Cat Form',
    icon: 'ability_druid_catform',
  },
  DASH: {
    id: 1850,
    name: 'Dash',
    icon: 'ability_druid_dash',
  },
  STAG_FORM: {
    id: 210053,
    name: 'Stag Form',
    icon: 'inv_stagform',
  },
  TRAVEL_FORM: {
    id: 783,
    name: 'Travel Form',
    icon: 'ability_druid_travelform',
  },
  SHRED: {
    id: 5221,
    name: 'Shred',
    icon: 'spell_shadow_vampiricaura',
  },
  WRATH: {
    id: 5176,
    name: 'Wrath',
    icon: 'spell_nature_wrathv2',
  },
  URSOLS_VORTEX: {
    id: 102793,
    name: "Ursol's Vortex",
    icon: 'spell_druid_ursolsvortex',
  },
  MOONKIN_FORM: {
    id: 24858,
    name: 'Moonkin Form',
    icon: 'spell_nature_forceofnature',
  },
  // TODO Nature's Vigil healing probably has different ID, need log to see it
  // damage from Nature's Vigil talent (cast and buff are the talent ID)
  NATURES_VIGIL_DAMAGE: {
    id: 124991,
    name: "Nature's Vigil",
    icon: 'achievement_zone_feralas',
  },

  /////////////////////////////////////////////////////////////////////////////
  // RESTO
  //
  MASTERY_HARMONY: {
    id: 77495,
    name: 'Mastery: Harmony',
    icon: 'spell_nature_healingway',
  },
  TRANQUILITY_CAST: {
    // this ID is the initial cast and the 'channel buff'
    id: 740,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility',
    manaCost: 1840,
  },
  TRANQUILITY_HEAL: {
    // this ID is the direct heal, the HoT heal, the HoT buff, and the 'tick cast'
    id: 157982,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility',
  },
  INNERVATE: {
    id: 29166,
    name: 'Innervate',
    icon: 'spell_nature_lightning',
  },
  IRONBARK: {
    id: 102342,
    name: 'Ironbark',
    icon: 'spell_druid_ironbark',
  },
  BARKSKIN: {
    id: 22812,
    name: 'Barkskin',
    icon: 'spell_nature_stoneclawtotem',
  },
  WILD_GROWTH: {
    id: 48438,
    name: 'Wild Growth',
    icon: 'ability_druid_flourish',
    manaCost: 2200,
  },
  REJUVENATION: {
    id: 774,
    name: 'Rejuvenation',
    icon: 'spell_nature_rejuvenation',
    manaCost: 1100,
  },
  REGROWTH: {
    id: 8936,
    name: 'Regrowth',
    icon: 'spell_nature_resistnature',
    manaCost: 1700,
  },
  LIFEBLOOM_HOT_HEAL: {
    // also the cast ID
    id: 33763,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom',
    manaCost: 800,
  },
  LIFEBLOOM_UNDERGROWTH_HOT_HEAL: {
    // with the Undergrowth talent, BOTH lifeblooms will have this ID
    id: 188550,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom',
    manaCost: 800,
  },
  LIFEBLOOM_BLOOM_HEAL: {
    id: 33778,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom',
  },
  CLEARCASTING_BUFF: {
    id: 16870,
    name: 'Clearcasting',
    icon: 'spell_shadow_manaburn',
  },
  EFFLORESCENCE_CAST: {
    id: 145205,
    name: 'Efflorescence',
    icon: 'inv_misc_herb_talandrasrose',
    manaCost: 1700,
  },
  EFFLORESCENCE_HEAL: {
    id: 81269,
    name: 'Efflorescence',
    icon: 'inv_misc_herb_talandrasrose',
  },
  //The heal that is trigger by the talent.
  CENARION_WARD_HEAL: {
    id: 102352,
    name: 'Cenarion Ward',
    icon: 'ability_druid_naturalperfection',
  },
  SWIFTMEND: {
    id: 18562,
    name: 'Swiftmend',
    icon: 'inv_relics_idolofrejuvenation',
    manaCost: 800,
  },
  ABUNDANCE_BUFF: {
    id: 207640,
    name: 'Abundance',
    icon: 'ability_druid_empoweredrejuvination',
  },
  NATURES_CURE: {
    id: 88423,
    name: "Nature's Cure",
    icon: 'ability_shaman_cleansespirit',
  },
  REJUVENATION_GERMINATION: {
    id: 155777,
    name: 'Germination',
    icon: 'spell_druid_germination',
  },
  CULTIVATION: {
    id: 200389,
    name: 'Cultivation',
    icon: 'ability_druid_nourish',
  },
  // Ysera's Gift has two heal IDs, one when it heals other players and one when it heals yourself.
  YSERAS_GIFT_OTHERS: {
    id: 145110,
    name: "Ysera's gift",
    icon: 'spell_nature_healingtouch',
  },
  YSERAS_GIFT_SELF: {
    id: 145109,
    name: "Ysera's gift",
    icon: 'spell_nature_healingtouch',
  },
  MARK_OF_SHIFTING: {
    id: 224392,
    name: 'Mark of Shifting',
    icon: 'spell_druid_tirelesspursuit',
  },
  NATURES_ESSENCE_DRUID: {
    // there is also a Shaman spell by the name "Nature's Essence"
    id: 189800,
    name: "Nature's Essence",
    icon: 'ability_druid_flourish',
  },
  SPRING_BLOSSOMS: {
    id: 207386,
    name: 'Spring Blossoms',
    icon: 'inv_misc_trailofflowers',
  },
  NOURISH: {
    id: 50464,
    name: 'Nourish',
    icon: 'ability_druid_nourish',
  },
  SOUL_OF_THE_FOREST_BUFF: {
    id: 114108,
    name: 'Soul of the Forest',
    icon: 'ability_druid_manatree',
  },
  // This buff indicates if the player is ABLE to assume Incarnation: Tree of Life form.
  // Actually BEING in the form is indicated by the INCARNATION_TREE_OF_LIFE_TALENT id.
  INCARNATION_TOL_ALLOWED: {
    id: 117679,
    name: 'Incarnation',
    icon: 'spell_druid_incarnation',
  },
  NATURES_SWIFTNESS: {
    id: 132158,
    name: "Nature's Swiftness",
    icon: 'spell_nature_ravenform',
  },
  // buff and heal from Grove Tending talent
  GROVE_TENDING: {
    id: 383193,
    name: 'Grove Tending',
    icon: 'inv_relics_idolofrejuvenation',
  },
  // buff and heal from Regenerative Heartwood talent
  REGENERATIVE_HEARTWOOD: {
    id: 392117,
    name: 'Regenerative Heartwood',
    icon: 'ability_druid_manatree',
  },
  // heal from Embrace of the Dream talent
  EMBRACE_OF_THE_DREAM: {
    id: 392147,
    name: 'Embrace of the Dream',
    icon: 'ability_druid_healinginstincts',
  },
  // heal from Verdancy talent
  VERDANCY: {
    id: 392329,
    name: 'Verdancy',
    icon: 'inv_10_herb_seed_magiccolor5',
  },
  // buff from Power of the Archdruid talent
  POWER_OF_THE_ARCHDRUID: {
    id: 392303,
    name: 'Power of the Archdruid',
    icon: 'spell_druid_rampantgrowth',
  },
  // heal from Thriving Vegetation talent
  THRIVING_VEGETATION: {
    id: 447132,
    name: 'Thriving Vegetation',
    icon: 'spell_nature_rejuvenation',
  },
  // Sets/Items:
  ASTRAL_HARMONY: {
    // 2pc T19
    id: 232378,
    name: 'Astral Harmony',
    icon: 'talentspec_druid_restoration',
  },
  RESTO_DRUID_TIER_28_2P_SET_BONUS: {
    // presence of this buff indicates player has 2pc equipped
    id: 364365,
    name: 'Renewing Bloom',
    icon: 'spell_unused',
  },
  RESTO_DRUID_TIER_28_4P_SET_BONUS: {
    // presence of this buff indicates player has 4pc equipped
    id: 363495,
    name: 'Ephemeral Incarnation',
    icon: 'spell_progenitor_orb2',
  },
  //Tier 29 Balance set bonus proc
  TOUCH_THE_COSMOS: {
    id: 394414,
    name: 'Touch the Cosmos - T29 4P',
    icon: 'ability_bossgorefiend_touchofdoom',
  },
  RENEWING_BLOOM: {
    // HoT procced by T28 2pc
    id: 364686,
    name: 'Renewing Bloom',
    icon: 'spell_unused',
  },
  NATURES_ESSENCE_TRAIT: {
    id: 189787,
    name: "Nature's Essence",
    icon: 'ability_druid_flourish',
  },
  // proc from Resto Druid T29 4pc
  CRITICAL_GROWTH: {
    id: 394565,
    name: 'Critical Growth',
    icon: 'ability_druid_flourish',
  },
  // proc from Resto Druid T30 4pc
  TENACIOUS_FLOURISHING: {
    id: 408546,
    name: 'Tenacious Flourishing',
    icon: 'talentspec_druid_restoration',
  },
  // 'Swiftmend' cast by Grove Guardians
  GROVE_GUARDIANS_SWIFTMEND: {
    id: 422094,
    name: 'Swiftmend',
    icon: 'inv_relics_idolofrejuvenation',
  },
  // 'Nourish' cast by Grove Guardians
  GROVE_GUARDIANS_NOURISH: {
    id: 422090,
    name: 'Nourish',
    icon: 'ability_druid_nourish',
  },
  // 'Wild Growth' cast by Grove Guardians
  GROVE_GUARDIANS_WILD_GROWTH: {
    id: 422382,
    name: 'Wild Growth',
    icon: 'ability_druid_flourish',
  },
  // proc from Resto Druid T31 2pc when Treant Nourish was the triggering spell
  T31_TREANT_CLEAVE_NOURISH: {
    id: 423612,
    name: 'Nourish',
    icon: 'ability_druid_nourish',
  },
  // proc from Resto Druid T31 2pc when Hardcast (or 4pc proc) Nourish was the triggering spell
  T31_CAST_CLEAVE_NOURISH: {
    id: 423618,
    name: 'Nourish',
    icon: 'ability_druid_nourish',
  },

  /////////////////////////////////////////////////////////////////////////////
  // GUARDIAN / BEAR
  //
  THICK_HIDE: {
    id: 16931,
    name: 'Thick Hide',
    icon: 'inv_misc_pelt_bear_03',
  },
  SWIPE_BEAR: {
    id: 213771,
    name: 'Swipe',
    icon: 'inv_misc_monsterclaw_03',
  },
  MANGLE_BEAR: {
    id: 33917,
    name: 'Mangle',
    icon: 'ability_druid_mangle2',
  },
  THRASH_BEAR: {
    id: 77758,
    name: 'Thrash',
    icon: 'spell_druid_thrash',
  },
  THRASH_BEAR_DOT: {
    id: 192090,
    name: 'Thrash',
    icon: 'spell_druid_thrash',
  },
  SURVIVAL_INSTINCTS: {
    id: 61336,
    name: 'Survival Instincts',
    icon: 'ability_druid_tigersroar',
  },
  IRONFUR: {
    id: 192081,
    name: 'Ironfur',
    icon: 'ability_druid_ironfur',
  },
  // The proc buff on the player
  TOOTH_AND_CLAW_BUFF: {
    id: 135286,
    name: 'Tooth and Claw',
    icon: 'inv_misc_monsterfang_01',
  },
  // The damage done debuff on the target
  TOOTH_AND_CLAW_DEBUFF: {
    id: 135601,
    name: 'Tooth and Claw',
    icon: 'inv_misc_monsterfang_01',
  },
  // when casting stampeding outside of cat or bear form, and puts caster into bear form
  STAMPEDING_ROAR_HUMANOID: {
    id: 106898,
    name: 'Stampeding Roar',
    icon: 'spell_druid_stamedingroar',
  },
  STAMPEDING_ROAR_CAT: {
    id: 77764,
    name: 'Stampeding Roar',
    icon: 'spell_druid_stampedingroar_cat',
  },
  STAMPEDING_ROAR_BEAR: {
    id: 77761,
    name: 'Stampeding Roar',
    icon: 'spell_druid_stamedingroar',
  },
  INCAPACITATING_ROAR: {
    id: 99,
    name: 'Incapacitating Roar',
    icon: 'ability_druid_demoralizingroar',
  },
  MOONFIRE_DEBUFF: {
    // the caster form and bear form debuff and damage ID
    id: 164812,
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
  },
  MOONFIRE_CAST: {
    // the caster form and bear form cast ID
    id: 8921,
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
  },
  PERPETUAL_SPRING_TRAIT: {
    id: 200402,
    name: 'Perpetual spring',
    icon: 'spell_nature_stoneclawtotem',
  },
  EMBRACE_OF_THE_NIGHTMARE: {
    id: 200855,
    name: 'Embrace of the nightmare',
    icon: 'inv_misc_herb_nightmarevine',
  },
  SCINTILLATING_MOONLIGHT: {
    id: 238049,
    name: 'Scintillating Moonlight',
    icon: 'spell_nature_starfall',
  },
  WILDFLESH_TRAIT: {
    id: 200400,
    name: 'Wildflesh',
    icon: 'ability_bullrush',
  },
  FLESHKNITTING_TRAIT: {
    id: 238085,
    name: 'Fleshknitting',
    icon: 'ability_bullrush',
  },
  BEAR_HUG_TRAIT: {
    id: 215799,
    name: 'Bear Hug',
    icon: 'spell_druid_bearhug',
  },
  GORE_BEAR: {
    id: 93622,
    name: 'Gore',
    icon: 'ability_druid_mangle2',
  },
  BRAMBLES_DAMAGE: {
    id: 213709,
    name: 'Brambles',
    icon: 'inv_misc_thornnecklace',
  },
  // passive spell with this ID granted to any druid with Restoration Affinity
  YSERAS_GIFT_BEAR: {
    id: 145108,
    name: "Ysera's gift",
    icon: 'inv_misc_head_dragon_green',
  },
  MAUL: {
    id: 6807,
    name: 'Maul',
    icon: 'ability_druid_maul',
  },
  GROWL: {
    id: 6795,
    name: 'Growl',
    icon: 'ability_physical_taunt',
  },
  SKULL_BASH: {
    id: 106839,
    name: 'Skull Bash',
    icon: 'inv_bone_skull_04',
  },
  REBIRTH: {
    id: 20484,
    name: 'Rebirth',
    icon: 'spell_nature_reincarnation',
  },
  ENTANGLING_ROOTS: {
    id: 339,
    name: 'Entangling Roots',
    icon: 'spell_nature_stranglevines',
  },
  REMOVE_CORRUPTION: {
    id: 2782,
    name: 'Remove Corruption',
    icon: 'spell_holy_removecurse',
  },
  GALACTIC_GUARDIAN: {
    id: 213708,
    name: 'Galactic Guardian',
    icon: 'spell_frost_iceclaw',
  },
  GUARDIAN_OF_ELUNE: {
    id: 213680,
    name: 'Guardian Of Elune',
    icon: 'spell_druid_guardianofelune',
  },
  URSOCS_ENDURANCE: {
    id: 200399,
    name: "Ursoc's Endurance",
    icon: 'ability_hunter_pet_bear',
  },
  PULVERIZE_BUFF: {
    id: 158792,
    name: 'Pulverize',
    icon: 'spell_druid_malfurionstenacity',
  },
  SKYSECS_HOLD_HEAL: {
    id: 208218,
    name: "Skysec's Hold",
    icon: 'spell_druid_bearhug',
  },
  BLOOD_FRENZY_TICK: {
    id: 203961,
    name: 'Blood Frenzy',
    icon: 'ability_druid_primaltenacity',
  },
  BRISTLING_FUR: {
    id: 204031,
    name: 'Bristling Fur',
    icon: 'spell_druid_bristlingfur',
  },
  OAKHEARTS_PUNY_QUODS_BUFF: {
    id: 236479,
    name: "Oakheart's Puny Quods",
    icon: 'spell_druid_bearhug',
  },
  EARTHWARDEN_BUFF: {
    id: 203975,
    name: 'Earthwarden',
    icon: 'spell_shaman_blessingofeternals',
  },
  GORY_FUR_BUFF: {
    id: 201671,
    name: 'Gory Fur',
    icon: 'artifactability_guardiandruid_goryfur',
  },
  FURY_OF_NATURE_HEAL: {
    id: 248522,
    name: 'Fury of Nature',
    icon: 'ability_creature_cursed_04',
  },
  // id for the cast and the buff
  BERSERK_BEAR: {
    id: 50334,
    name: 'Berserk',
    icon: 'ability_druid_berserk',
  },
  // id for the cast and the buff
  INCARNATION_GUARDIAN_OF_URSOC: {
    id: 102558,
    name: 'Incarnation: Guardian of Ursoc',
    icon: 'spell_druid_incarnation',
  },
  GUARDIAN_TIER_21_2P_SET_BONUS: {
    id: 251791,
    name: 'Tier 21 2P Bonus',
    icon: 'ability_druid_cower',
  },
  GUARDIAN_TIER_21_4P_SET_BONUS: {
    id: 251792,
    name: 'Tier 21 4P Bonus',
    icon: 'ability_druid_cower',
  },
  GUARDIAN_TIER_21_4P_SET_BONUS_BUFF: {
    id: 253575,
    name: 'Regenerative Fur',
    icon: 'ability_druid_kingofthejungle',
  },
  MASTERY_NATURES_GUARDIAN_HEAL: {
    id: 227034,
    name: "Mastery: Nature's Guardian",
    icon: 'spell_druid_primaltenacity',
  },

  /////////////////////////////////////////////////////////////////////////////
  // BALANCE / MOONKIN
  //
  ASTRAL_INFLUENCE: {
    id: 197524,
    name: 'Astral Influence',
    icon: 'ability_skyreach_lens_flare',
  },
  STARSURGE_MOONKIN: {
    id: 78674,
    name: 'Starsurge',
    icon: 'spell_arcane_arcane03',
  },
  STARFIRE: {
    id: 194153,
    name: 'Starfire',
    icon: 'spell_arcane_starfire',
  },
  WRATH_MOONKIN: {
    id: 190984,
    name: 'Wrath',
    icon: 'spell_nature_wrathv2',
  },
  SUNFIRE: {
    id: 164815,
    name: 'Sunfire',
    icon: 'ability_mage_firestarter',
  },
  SUNFIRE_CAST: {
    id: 93402,
    name: 'Sunfire',
    icon: 'ability_mage_firestarter',
  },
  STARLORD: {
    id: 279709,
    name: 'Starlord',
    icon: 'spell_shaman_measuredinsight',
  },
  STARFALL: {
    id: 191037,
    name: 'Starfall',
    icon: 'ability_druid_starfall',
  },
  STARFALL_CAST: {
    id: 191034,
    name: 'Starfall',
    icon: 'ability_druid_starfall',
  },
  FULL_MOON: {
    id: 274283,
    name: 'Full Moon',
    icon: 'artifactability_balancedruid_fullmoon',
  },
  HALF_MOON: {
    id: 274282,
    name: 'Half Moon',
    icon: 'artifactability_balancedruid_halfmoon',
  },
  CELESTIAL_ALIGNMENT: {
    id: 194223,
    name: 'Celestial Alignment',
    icon: 'spell_nature_natureguardian',
  },
  CELESTIAL_ALIGNMENT_ORBITAL_STRIKE: {
    // CA has different cast ID when Orbital Strike is talented
    id: 383410,
    name: 'Celestial Alignment',
    icon: 'spell_nature_natureguardian',
  },
  INCARNATION_ORBITAL_STRIKE: {
    // Incarn has different cast ID when Orbital Strike is talented
    id: 390414, // TODO double check this
    name: 'Incarnation: Chosen of Elune',
    icon: 'spell_druid_incarnation',
  },
  NATURES_GRACE: {
    id: 393959,
    name: "Nature's Grace",
    icon: 'spell_nature_naturesblessing',
  },
  OWLKIN_FRENZY: {
    id: 157228,
    name: 'Owlkin Frenzy',
    icon: 'ability_druid_owlkinfrenzy',
  },
  SOLAR_BEAM: {
    id: 78675,
    name: 'Solar Beam',
    icon: 'ability_vehicle_sonicshockwave',
  },
  SHOOTING_STARS: {
    id: 202497,
    name: 'Shooting Stars',
    icon: 'spell_priest_divinestar_shadow2',
  },
  ECLIPSE: {
    id: 79577,
    name: 'Eclipse',
    icon: 'ability_druid_eclipseorange',
  },
  ECLIPSE_SOLAR: {
    id: 48517,
    name: 'Eclipse (Solar)',
    icon: 'ability_druid_eclipseorange',
  },
  ECLIPSE_LUNAR: {
    id: 48518,
    name: 'Eclipse (Lunar)',
    icon: 'ability_druid_eclipse',
  },
  MASTERY_TOTAL_ECLIPSE: {
    id: 326085,
    name: 'Mastery: Total Eclipse',
    icon: 'ability_druid_eclipse',
  },
  CYCLONE: {
    id: 33786,
    name: 'Cyclone',
    icon: 'spell_nature_earthbind',
  },
  FURY_OF_ELUNE_DAMAGE: {
    // the damage only - the cast buff and energize use the talent's ID
    id: 211545,
    name: 'Fury of Elune',
    icon: 'ability_druid_dreamstate',
  },
  FURY_OF_ELUNE_DAMAGE_SUNDERED_FIRMAMENT: {
    // damage from Fury of Elune procced by the talent Sundered Firmament
    id: 394111,
    name: 'Fury of Elune - Sundered Firmament',
    icon: 'ability_druid_dreamstate',
  },
  SUNDERED_FIRMAMENT_RESOURCE: {
    // AP generated from Fury of Elune procced by the talent Sundered Firmament
    id: 394108,
    name: 'Sundered Firmament',
    icon: 'spell_druid_equinox',
  },
  WANING_TWILIGHT: {
    // Debuff on enemy when druid has waning twilight talent and 3 periodic effects on enemy.
    id: 393957,
    name: 'Waning Twilight',
    icon: 'spell_shadow_twilight',
  },
  GATHERING_STARSTUFF: {
    // Buff from dragonflight T29 2p
    id: 394412,
    name: 'Gathering Starstuff - T29 2P',
    icon: 'spell_nature_wrathv2',
  },
  BALANCE_OF_ALL_THINGS_LUNAR: {
    id: 394050,
    name: 'Balance of All Things',
    icon: 'ability_druid_earthandsky',
  },
  BALANCE_OF_ALL_THINGS_SOLAR: {
    id: 394049,
    name: 'Balance of All Things',
    icon: 'ability_druid_earthandsky',
  },
  FRIEND_OF_THE_FAE: {
    id: 394083,
    name: 'Friend of the Fae',
    icon: 'inv_elemental_primal_mana',
  },
  RATTLED_STARS: {
    id: 393955,
    name: 'Rattled Stars',
    icon: 'spell_arcane_arcane01',
  },
  STARWEAVERS_WARP: {
    id: 393942,
    name: "Starweaver's Warp",
    icon: 'ability_druid_stellarflare',
  },
  STARWEAVERS_WEFT: {
    id: 393944,
    name: "Starweaver's Weft",
    icon: 'spell_arcane_invocation',
  },
  // the damage ID for wild mushroom's initial burst
  WILD_MUSHROOM: {
    id: 88751,
    name: 'Wild Mushroom',
    icon: 'druid_ability_wildmushroom_b',
  },
  ORBITAL_STRIKE: {
    id: 361237,
    name: 'Orbital Strike',
    icon: 'spell_nature_natureguardian',
  },
  CRASHING_STAR: {
    id: 408310,
    name: 'Crashing Star',
    icon: 'ability_druid_starfall',
  },
  WARRIOR_OF_ELUNE: {
    id: 202425,
    name: 'Warrior of Elune',
    icon: 'spell_holy_elunesgrace',
  },

  /////////////////////////////////////////////////////////////////////////////
  // FERAL / CAT
  //
  SWIPE_CAT: {
    id: 106785,
    name: 'Swipe',
    icon: 'inv_misc_monsterclaw_03',
  },
  FEROCIOUS_BITE: {
    id: 22568,
    name: 'Ferocious Bite',
    icon: 'ability_druid_ferociousbite',
  },
  RIP: {
    id: 1079,
    name: 'Rip',
    icon: 'ability_ghoulfrenzy',
  },
  TIGERS_FURY: {
    id: 5217,
    name: "Tiger's Fury",
    icon: 'ability_mount_jungletiger',
  },
  SKULL_BASH_FERAL: {
    id: 93985,
    name: 'Skull Bash',
    icon: 'inv_bone_skull_04',
  },
  PRIMAL_FURY: {
    id: 16953,
    name: 'Primal Fury',
    icon: 'ability_racial_cannibalize',
  },
  MAIM: {
    id: 22570,
    name: 'Maim',
    icon: 'ability_druid_mangle',
  },
  MAIM_DEBUFF: {
    // the stun caused by Maim, which shows in the log as a 0 damage event
    id: 203123,
    name: 'Maim',
    icon: 'ability_druid_mangle',
  },
  // Rake's cast and DIRECT damage
  RAKE: {
    id: 1822,
    name: 'Rake',
    icon: 'ability_druid_disembowel',
  },
  // Rake's debuff and DOT damage
  RAKE_BLEED: {
    id: 155722,
    name: 'Rake',
    icon: 'ability_druid_disembowel',
  },
  // Rake's stun debuff when used from stealth
  RAKE_STUN: {
    id: 163505,
    name: 'Rake',
    icon: 'ability_druid_disembowel',
  },
  MOONFIRE_FERAL: {
    id: 155625,
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
  },
  // ID for the cast, resource change, and direct damage
  THRASH_FERAL: {
    id: 106830,
    name: 'Thrash',
    icon: 'spell_druid_thrash',
  },
  // ID for the debuff and DoT damage
  THRASH_FERAL_BLEED: {
    id: 405233,
    name: 'Thrash',
    icon: 'spell_druid_thrash',
  },
  // this is the spell for the cast and the buff
  BERSERK_CAT: {
    id: 106951,
    name: 'Berserk',
    icon: 'ability_druid_berserk',
  },
  // this is the spell for the combo point refund (anything else?)
  BERSERK_ENERGIZE: {
    id: 343216,
    name: 'Berserk',
    icon: 'ability_druid_berserk',
  },
  PROWL: {
    id: 5215,
    name: 'Prowl',
    icon: 'ability_druid_prowl',
  },
  // a version of prowl that can be activated in combat through the Incarnation: King of the Jungle talent
  PROWL_INCARNATION: {
    id: 102547,
    name: 'Prowl',
    icon: 'ability_druid_prowl',
  },
  // buff from the bloodtalons talent (different id from BLOODTALONS_TALENT)
  BLOODTALONS_BUFF: {
    id: 145152,
    name: 'Bloodtalons',
    icon: 'spell_druid_bloodythrash',
  },
  // bleed from Feral Frenzy and also the CP energize
  FERAL_FRENZY_DEBUFF: {
    id: 274838,
    name: 'Feral Frenzy',
    icon: 'ability_druid_rake',
  },
  CLEARCASTING_FERAL: {
    id: 135700,
    name: 'Clearcasting',
    icon: 'spell_shadow_manaburn',
  },
  INFECTED_WOUNDS_DEBUFF: {
    id: 58180,
    name: 'Infected Wounds',
    icon: 'ability_druid_infectedwound',
  },
  MASTERY_RAZOR_CLAWS: {
    id: 77493,
    name: 'Mastery: Razor Claws',
    icon: 'inv_misc_monsterclaw_05',
  },
  PREDATORY_SWIFTNESS: {
    id: 69369,
    name: 'Predatory Swiftness',
    icon: 'ability_hunter_pet_cat',
  },
  // This buff indicates if the player is ABLE to assume Incarnation: Avatar of Ashamane form.
  // Actually BEING in the form is indicated by the INCARNATION_AVATAR_OF_ASHAMANE_TALENT id.
  INCARNATION_AOA_ALLOWED: {
    id: 252071,
    name: 'Incarnation: Avatar of Ashamane',
    icon: 'ability_mount_siberiantigermount',
  },
  // effect that shows up in the combat log for energy generated from feral's Soul of the Forest talent.
  SOUL_OF_THE_FOREST_FERAL_ENERGY: {
    id: 114113,
    name: 'Soul of the Forest',
    icon: 'ability_druid_manatree',
  },
  // resourcechange from Primal Claws talent
  PRIMAL_CLAWS: {
    id: 393617,
    name: 'Primal Claws',
    icon: 'ability_druid_rake',
  },
  // debuff from Sabertooth talent
  SABERTOOTH: {
    id: 391722,
    name: 'Sabertooth',
    icon: 'inv_misc_monsterfang_01',
  },
  // debuff/bleed from Tear talent
  TEAR: {
    id: 391356,
    name: 'Tear',
    icon: 'artifactability_feraldruid_ashamanesbite',
  },
  // damage from Rampant Ferocity talent
  RAMPANT_FEROCITY: {
    id: 391710,
    name: 'Rampant Ferocity',
    icon: 'ability_druid_primaltenacity',
  },
  // buff from Sudden Ambush talent
  SUDDEN_AMBUSH_BUFF: {
    id: 391974,
    name: 'Sudden Ambush',
    icon: 'ability_hunter_catlikereflexes',
  },
  // damage from Berserk: Frenzy talent
  FRENZIED_ASSAULT: {
    id: 391140,
    name: 'Frenzied Assault',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  // Buff procced by Apex Predator's Craving talent
  APEX_PREDATORS_CRAVING_BUFF: {
    id: 391882,
    name: "Apex Predator's Craving",
    icon: 'ability_druid_primaltenacity',
  },
  // buff from Frantic Momentum talent
  FRANTIC_MOMENTUM: {
    id: 391876,
    name: 'Frantic Momentum',
    icon: 'spell_druid_savagery',
  },
  // resourcechange from Cat's Curiosity
  CATS_CURIOSITY: {
    id: 339145,
    name: "Cat's Curiosity",
    icon: 'inv_jewelcrafting_gem_30',
  },
  // debuff from Dire Fixation
  DIRE_FIXATION_DEBUFF: {
    id: 417713,
    name: 'Dire Fixation',
    icon: 'ability_druid_primalprecision',
  },
  // feral legion tier sets
  FERAL_DRUID_T19_2SET_BONUS_BUFF: {
    id: 211140,
    name: 'T19 2 set bonus',
    icon: 'trade_engineering',
  },
  FERAL_DRUID_T19_4SET_BONUS_BUFF: {
    id: 211142,
    name: 'T19 4 set bonus',
    icon: 'trade_engineering',
  },
  FERAL_DRUID_T20_2SET_BONUS_BUFF: {
    id: 242234,
    name: 'T20 2 set bonus',
    icon: 'ability_druid_catform',
  },
  ENERGETIC_RIP: {
    id: 245591,
    name: 'Energetic Rip',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  SAVAGE_FURY_BUFF: {
    id: 449646,
    name: 'Savage Fury',
    icon: 'ability_druid_kingofthejungle',
  },
  FERAL_DRUID_T20_4SET_BONUS_BUFF: {
    id: 242235,
    name: 'T20 4 set bonus',
    icon: 'ability_druid_catform',
  },
  FERAL_DRUID_T21_2SET_BONUS_BUFF: {
    id: 251789,
    name: 'T21 2 set bonus',
    icon: 'ability_druid_cower',
  },
  HEART_OF_THE_LION: {
    // hidden? buff from Feral T28 2pc
    id: 364416,
    name: 'Heart of the Lion',
    icon: 'spell_progenitor_beam',
  },
  SICKLE_OF_THE_LION: {
    // damage from Feral T28 4pc
    id: 363830,
    name: 'Sickle of the Lion',
    icon: 'ability_xavius_tormentingswipe',
  },
  BLOODY_GASH: {
    id: 252750,
    name: 'Bloody Gash',
    icon: 'artifactability_feraldruid_ashamanesbite',
  },
  FERAL_DRUID_T21_4SET_BONUS_BUFF: {
    id: 251790,
    name: 'T21 4 set bonus',
    icon: 'ability_druid_cower',
  },
  APEX_PREDATOR: {
    id: 252752,
    name: 'Apex Predator',
    icon: 'ability_druid_primaltenacity',
  },
  // DoT procced by Frenzyband legendary
  FRENZIED_ASSAULT_SHADOWLANDS: {
    id: 340056,
    name: 'Frenzied Assault',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  // Buff procced by Apex Predator's Craving legendary
  APEX_PREDATORS_CRAVING_BUFF_SHADOWLANDS: {
    id: 339140,
    name: "Apex Predator's Craving",
    icon: 'ability_druid_primaltenacity',
  },
  SUDDEN_AMBUSH_BUFF_SHADOWLANDS: {
    // Buff procced by Sudden Ambush conduit
    id: 340698,
    name: 'Sudden Ambush',
    icon: 'ability_hunter_catlikereflexes',
  },
  // Buff procced by T29 4pc
  SHARPENED_CLAWS: {
    id: 394465,
    name: 'Sharpened Claws',
    icon: 'inv_misc_monsterfang_01',
  },
  // Buff procced by T31 2pc
  SMOLDERING_FRENZY: {
    id: 422751,
    name: 'Smoldering Frenzy',
    icon: 'inv_staff_99',
  },

  /////////////////////////////////////////////////////////////////////////////
  // WILDSTALKER
  //

  // 'wildstalker' to differentiate from very similarly named Evoker spell
  SYMBIOTIC_BLOOMS_WILDSTALKER: {
    id: 439530,
    name: 'Symbiotic Blooms',
    icon: 'inv_misc_lifeblood',
  },
  BLOODSEEKER_VINES: {
    id: 439531,
    name: 'Bloodseeker Vines',
    icon: 'inv_misc_herb_16',
  },
  BURSTING_GROWTH_HEAL: {
    id: 440121,
    name: 'Bursting Growth',
    icon: 'inv_collections_armor_flowerbracelet_b_01',
  },
  BURSTING_GROWTH_DAMAGE: {
    id: 440122,
    name: 'Bursting Growth',
    icon: 'inv_misc_thornnecklace',
  },
  FLOWER_WALK: {
    id: 439902,
    name: 'Flower Walk',
    icon: 'inv_misc_trailofflowers',
  },

  /////////////////////////////////////////////////////////////////////////////
  // DRUID OF THE CLAW
  //

  // this is the cast ID (replaces FB) and the damage ID (direct and cleave)
  RAVAGE_DOTC_CAT: {
    id: 441591,
    name: 'Ravage',
    icon: 'inv_ability_druidoftheclawdruid_ravage',
  },
  // this is the DoT debuff and damage ID
  DREADFUL_WOUND: {
    id: 441812,
    name: 'Dreadful Wound',
    icon: 'artifactability_feraldruid_openwounds',
  },

  /////////////////////////////////////////////////////////////////////////////
  // ELUNE'S CHOSEN
  //

  /////////////////////////////////////////////////////////////////////////////
  // KEEPER OF THE GROVE
  //

  CENARIUS_MIGHT_BUFF: {
    id: 455801,
    name: "Cenarius' Might",
    icon: 'achievement_reputation_guardiansofcenarius',
  },
  // heal from Dream Surge 'dream petals'
  DREAM_BLOOM: {
    id: 434141,
    name: 'Dream Bloom',
    icon: 'inv_ability_keeperofthegrovedruid_dreamsurge_fiendly',
  },

  // TODO TWW find a log with the ID of the "minor cenarion ward" applied 'Durability of Nature'
  //      ... it appears to be the less popular choice on the node unforch
} satisfies Record<string, Spell>;

export default spells;
