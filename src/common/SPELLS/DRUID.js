/**
 * All Druid abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Shared
  STARSURGE: { // Balance has a spec specific spell that replaces this, this is the version everyone has access to due to balance affinity
    id: 197626,
    name: 'Starsurge',
    icon: 'spell_arcane_arcane03',
  },

  // RESTO DRUID //

  // Mastery
  MASTERY_HARMONY: {
    id: 77495,
    name: 'Mastery: Harmony',
    icon: 'spell_nature_healingway',
  },

  // Spells / Buffs
  TRANQUILITY_CAST: {
    id: 740,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility',
    manaCost: 40480,
  },
  TRANQUILITY_HEAL: {
    id: 157982,
    name: 'Tranquility',
    icon: 'spell_nature_tranquility',
  },
  INNERVATE: {
    id: 29166,
    name: 'Innervate',
    icon: 'spell_nature_lightning',
  },
  ESSENCE_OF_GHANIR: {
    id: 208253,
    name: 'Essence of G\'Hanir',
    icon: 'inv_staff_2h_artifactnordrassil_d_01',
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
    //manaCost: 68816,
  },
  REJUVENATION: {
    id: 774,
    name: 'Rejuvenation',
    icon: 'spell_nature_rejuvenation',
    manaCost: 22000,
  },
  HEALING_TOUCH: {
    id: 5185,
    name: 'Healing Touch',
    icon: 'spell_nature_healingtouch',
    manaCost: 19800,
  },
  REGROWTH: {
    id: 8936,
    name: 'Regrowth',
    icon: 'spell_nature_resistnature',
    manaCost: 40986,
  },
  LIFEBLOOM_HOT_HEAL: {
    id: 33763,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom',
    manaCost: 26400,
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
    manaCost: 47520,
  },
  EFFLORESCENCE_HEAL: {
    id: 81269,
    name: 'Efflorescence',
    icon: 'inv_misc_herb_talandrasrose',
  },
  CENARION_WARD: {
    id: 102352,
    name: 'Cenarion Ward',
    icon: 'ability_druid_naturalperfection',
    manaCost: 20240,
  },
  SWIFTMEND: {
    id: 18562,
    name: 'Swiftmend',
    icon: 'inv_relics_idolofrejuvenation',
    manaCost: 30800,
  },
  FRENZIED_REGENERATION: {
    id: 22842,
    name: 'Frenzied Regeneration',
    icon: 'ability_bullrush',
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
  FEROCIOUS_BITE: {
    id: 22568,
    name: 'Ferocious Bite',
    icon: 'ability_druid_ferociousbite',
  },
  NATURES_CURE: {
    id: 88423,
    name: 'Nature\'s Cure',
    icon: 'ability_shaman_cleansespirit',
  },
  RAKE: {
    id: 1822,
    name: 'Rake',
    icon: 'ability_druid_disembowel',
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
  RIP: {
    id: 1079,
    name: 'Rip',
    icon: 'ability_ghoulfrenzy',
  },
  SHRED: {
    id: 5221,
    name: 'Shred',
    icon: 'spell_shadow_vampiricaura',
  },
  SOLAR_WRATH: {
    id: 5176,
    name: 'Solar Wrath',
    icon: 'spell_nature_wrathv2',
  },
  CAT_SWIPE: {
    id: 106785,
    name: 'Swipe',
    icon: 'inv_misc_monsterclaw_03',
  },
  SWIPE_BEAR: {
    id: 213771,
    name: 'Swipe',
    icon: 'inv_misc_monsterclaw_03',
  },
  URSOLS_VORTEX: {
    id: 102793,
    name: 'Ursol\'s Vortex',
    icon: 'spell_druid_ursolsvortex',
  },
  MOONKIN_FORM: {
    id: 24858,
    name: 'Moonkin Form',
    icon: 'spell_nature_forceofnature',
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
    name: 'Ysera\'s gift',
    icon: 'spell_nature_healingtouch',
  },
  YSERAS_GIFT_SELF: {
    id: 145109,
    name: 'Ysera\'s gift',
    icon: 'spell_nature_healingtouch',
  },
  LIVING_SEED: {
    id: 48503,
    name: 'Living Seed',
    icon: 'ability_druid_giftoftheearthmother',
  },
  MARK_OF_SHIFTING: {
    id: 224392,
    name: 'Mark of Shifting',
    icon: 'spell_druid_tirelesspursuit',
  },
  POWER_OF_THE_ARCHDRUID_BUFF: {
    id: 189877,
    name: 'Power of the Archdruid',
    icon: 'spell_druid_rampantgrowth',
  },
  DREAMWALKER: {
    id: 189853,
    name: 'Dreamwalker',
    icon: 'ability_druid_healinginstincts',
  },
  NATURES_ESSENCE_DRUID: { // there is also a Shaman spell by the name "Nature's Essence"
    id: 189800,
    name: 'Nature\'s Essence',
    icon: 'ability_druid_flourish',
  },
  SPRING_BLOSSOMS: {
    id: 207386,
    name: 'Spring Blossoms',
    icon: 'inv_misc_trailofflowers',
  },
  SOUL_OF_THE_FOREST_BUFF: {
    id: 114108,
    name: 'Soul of the Forest',
    icon: 'ability_druid_manatree',
  },

  // Sets/Items:
  // Hidden buffs that indicate set is equipped:
  RESTO_DRUID_T19_2SET_BONUS_BUFF: {
    id: 211165,
    name: 'T19 2 set bonus',
    icon: 'talentspec_druid_restoration',
  },
  RESTO_DRUID_T19_4SET_BONUS_BUFF: {
    id: 211170,
    name: 'T19 4 set bonus',
    icon: 'talentspec_druid_restoration',
  },
  RESTO_DRUID_T20_2SET_BONUS_BUFF: {
    id: 242238,
    name: 'T20 2 set bonus',
    icon: 'inv_relics_idolofrejuvenation',
  },
  RESTO_DRUID_T20_4SET_BONUS_BUFF: {
    id: 242313,
    name: 'T20 4 set bonus',
    icon: 'inv_misc_herb_talandrasrose',
  },
  RESTO_DRUID_T21_2SET_BONUS_BUFF: {
    id: 251813,
    name: 'T21 2 set bonus',
    icon: 'ability_druid_cower',
  },
  RESTO_DRUID_T21_4SET_BONUS_BUFF: {
    id: 251814,
    name: 'T21 4 set bonus',
    icon: 'ability_druid_cower',
  },
  // Visible procs produced by set/item:
  ASTRAL_HARMONY: { // 2pc T19
    id: 232378,
    name: 'Astral Harmony',
    icon: 'talentspec_druid_restoration',
  },
  BLOSSOMING_EFFLORESCENCE: { // 4pc T20
    id: 242315,
    name: 'Blossomming Efflorescence',
    icon: 'inv_misc_herb_talandrasrose',
  },
  DREAMER: { // 2pc T21
    id: 253432,
    name: 'Dreamer',
    icon: 'ability_druid_cower',
  },
  AWAKENED: { // 4pc T21
    id: 253434,
    name: 'Awakened',
    icon: 'ability_druid_cower',
  },
  XONIS_CARESS: {
    id: 235040,
    name: "X'oni's Caress",
    icon: 'spell_druid_ironbark',
  },
  //Guardian Druid T19 2set
  GUARDIAN_DRUID_T19_2SET_BONUS_BUFF: {
    id: 211149,
    name: 'T19 2 set bonus',
    icon: 'trade_engineering',
  },

  // Traits:
  POWER_OF_THE_ARCHDRUID: {
    id: 189870,
    name: 'Power of the Archdruid',
    icon: 'spell_druid_rampantgrowth',
  },
  NATURES_ESSENCE_TRAIT: {
    id: 189787,
    name: 'Nature\'s Essence',
    icon: 'ability_druid_flourish',
  },
  DREAMWALKER_TRAIT: {
    id: 189849,
    name: 'Dreamwalker',
    icon: 'ability_druid_healinginstincts',
  },
  PERSISTENCE_TRAIT: {
    id: 186396,
    name: 'Persistence',
    icon: 'spell_nature_starfall',
  },
  GROVEWALKER: {
    id: 186320,
    name: 'Grovewalker',
    icon: 'spell_nature_healingtouch',
  },
  NATURAL_MENDING: {
    id: 189749,
    name: 'Natural Mending',
    icon: 'inv_relics_idolofrejuvenation',
  },
  ESSENCE_OF_NORDRASSIL: {
    id: 189760,
    name: 'Essence of Norddrassil',
    icon: 'inv_misc_herb_talandrasrose',
  },
  BLESSING_OF_THE_WORLD_TREE: {
    id: 189744,
    name: 'Blessing of the World Tree',
    icon: 'ability_druid_naturalperfection',
  },
  ETERNAL_RESTORATION: {
    id: 238050,
    name: 'Eternal Restoration',
    icon: 'inv_staff_2h_artifactnordrassil_d_01',
  },
  SEEDS_OF_THE_WORLD_TREE: {
    id: 189768,
    name: 'Seeds of the World Tree',
    icon: 'ability_druid_giftoftheearthmother',
  },
  INFUSION_OF_NATURE: {
    id: 189757,
    name: 'Infusion of Nature',
    icon: 'ability_druid_flourish',
  },
  KNOWLEDGE_OF_THE_ANCIENTS: {
    id: 189772,
    name: 'Knowledge of the Ancients',
    icon: 'ability_druid_manatree',
  },
  ARMOR_OF_THE_ANCIENTS: {
    id: 189754,
    name: 'Armor of the Ancients',
    icon: 'spell_druid_ironbark',
  },
  DEEP_ROOTED_TRAIT: {
    id: 238122,
    name: 'Deep Rooted',
    icon: 'inv_misc_herb_liferoot_stem',
  },

  // GUARDIAN //
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
  STAMPEDING_ROAR_CAT: {
    id: 106898,
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
  RAGE_OF_THE_SLEEPER: {
    id: 200851,
    name: 'Rage of the Sleeper',
    icon: 'inv_hand_1h_artifactursoc_d_01',
  },
  MOONFIRE_BEAR: {
    id: 164812,
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
  },
  MOONFIRE: {
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
  YSERAS_GIFT_BEAR: {
    id: 145108,
    name: 'Ysera\'s gift',
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
    name: 'Ursoc\'s Endurance',
    icon: 'ability_hunter_pet_bear',
  },
  PULVERIZE_BUFF: {
    id: 158792,
    name: 'Pulverize',
    icon: 'spell_druid_malfurionstenacity',
  },
  SKYSECS_HOLD_HEAL: {
    id: 208218,
    name: 'Skysec\'s Hold',
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
    name: 'Oakheart\'s Puny Quods',
    icon: 'spell_druid_bearhug',
  },
  EARTHWARDEN_BUFF: {
    id: 203975,
    name: 'Earthwarden',
    icon: 'spell_shaman_blessingofeternals',
  },
  FURY_OF_NATURE_HEAL: {
    id: 248522,
    name: 'Fury of Nature',
    icon: 'ability_creature_cursed_04',
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
    name: 'Mastery: Nature\'s Guardian',
    icon: 'spell_druid_primaltenacity',
  },
  // Moonkin
  STARSURGE_MOONKIN: {
    id: 78674,
    name: 'Starsurge',
    icon: 'spell_arcane_arcane03',
  },
  LUNAR_STRIKE: {
    id: 194153,
    name: 'Lunar Strike',
    icon: 'spell_arcane_starfire',
  },
  SOLAR_WRATH_MOONKIN: {
    id: 190984,
    name: 'Solar Wrath',
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
  // MOONFIRE = MOONFIRE_BEAR
  // MOONFIRE_CAST = MOONFIRE
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
    id: 202771,
    name: 'Full Moon',
    icon: 'artifactability_balancedruid_fullmoon',
  },
  HALF_MOON: {
    id: 202768,
    name: 'Half Moon',
    icon: 'artifactability_balancedruid_halfmoon',
  },
  NEW_MOON: {
    id: 202767,
    name: 'New Moon',
    icon: 'artifactability_balancedruid_newmoon',
  },
  CELESTIAL_ALIGNMENT: {
    id: 194223,
    name: 'Celestial Alignment',
    icon: 'spell_nature_natureguardian',
  },
  LUNAR_EMP_BUFF: {
    id: 164547,
    name: 'Lunar Empowement',
    icon: 'spell_arcane_starfire',
  },
  SOLAR_EMP_BUFF: {
    id: 164545,
    name: 'Celestial Alignment',
    icon: 'spell_nature_wrathv2',
  },
  OWLKIN_FRENZY: {
    id: 157228,
    name: 'Owlkin Frenzy',
    icon: 'ability_druid_owlkinfrenzy',
  },
  THE_EMERALD_DREAMCATCHER: {
    id: 224706,
    name: 'The Emerald Dreamcatcher',
    icon: 'inv_helmet_81',
  },
  ASTRAL_ACCELERATION: {
    id: 242232,
    name: 'Astral Acceleration',
    icon: 'inv_enchant_essenceastrallarge',
  },
  STAR_POWER: {
    id: 202942,
    name: 'Star Power',
    icon: 'artifactability_balancedruid_moonandstars',
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
  BLESSING_OF_ANSHE: {
    id: 202739,
    name: 'Blessing of An\'she',
    icon: 'spell_priest_divinestar_holy',
  },
  BLESSING_OF_ELUNE: {
    id: 202737,
    name: 'Blessing of Elune',
    icon: 'achievement_worldevent_lunar',
  },
  ONETHS_INTUITION: {
    id: 209406,
    name: 'Oneth\'s Intuition',
    icon: 'spell_arcane_invocation',
  },
  ONETHS_OVERCONFIDENCE: {
    id: 209407,
    name: 'Oneth\'s Overconfidence',
    icon: 'ability_druid_stellarflare',
  },
  ECHOING_STARS: {
    id: 226104,
    name: 'Echoing Stars',
    icon: 'ability_socererking_forcenova',
  },
  BALANCE_DRUID_T20_2SET_BONUS_BUFF: {
    id: 242231,
    name: 'T20 2 set bonus',
    icon: 'spell_nature_starfall',
  },
  BALANCE_DRUID_T20_4SET_BONUS_BUFF: {
    id: 242233,
    name: 'T20 4 set bonus',
    icon: 'spell_nature_starfall',
  },
  BALANCE_DRUID_T21_2SET_BONUS_BUFF: {
    id: 251803,
    name: 'T21 2 set bonus',
    icon: 'ability_druid_cower',
  },
  BALANCE_DRUID_T21_4SET_BONUS_BUFF: {
    id: 251809,
    name: 'T21 4 set bonus',
    icon: 'ability_druid_cower',
  },
  SOLAR_SOLSTICE: {
    id: 252767,
    name: 'Solar Solstice',
    icon: 'spell_druid_sunfall',
  },
  // Feral
  TIGERS_FURY: {
    id: 5217,
    name: 'Tiger\'s Fury',
    icon: 'ability_mount_jungletiger',
  },
  SKULL_BASH_FERAL: {
    id: 93985,
    name: 'Skull Bash',
    icon: 'inv_bone_skull_04',
  },
  SHADOWMELD: {
    id: 58984,
    name: 'Shadowmeld',
    icon: 'ability_ambush',
  },
  ASHAMANES_FRENZY: {
    id: 210722,
    name: 'Ashamane\'s Frenzy',
    icon: 'inv_knife_1h_artifactfrostsaber_d_01',
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
  RAKE_BLEED: {
    id: 155722,
    name: 'Rake',
    icon: 'ability_druid_disembowel',
  },
  MOONFIRE_FERAL: {
    id: 155625,
    name: 'Moonfire',
    icon: 'spell_nature_starfall',
  },
  THRASH_FERAL: {
    id: 106830,
    name: 'Thrash',
    icon: 'spell_druid_thrash',
  },
  BERSERK: {
    id: 106951,
    name: 'Berserk',
    icon: 'ability_druid_berserk',
  },
  // Traits:
  // The Ashamane's Bite trait creates the Ashamane's Rip debuff.
  ASHAMANES_BITE: {
    id: 210702,
    name: 'Ashamane\'s Bite',
    icon: 'artifactability_feraldruid_ashamanesbite',
  },
  ASHAMANES_RIP: {
    id: 210705,
    name: 'Ashamane\'s Rip',
    icon: 'artifactability_feraldruid_ashamanesbite',
  },
};
