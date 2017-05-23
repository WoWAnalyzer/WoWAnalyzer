/*
// Script to quickly get an object in the desired format from Wowhead (don't forget to manually save the icon):

var spellId = window.location.href.match(/.*spell=([0-9]+)\//)[1];
var spellName = $('#main-contents > div:nth-child(8) > h1').text();
var icon = $('#infobox-contents0 > ul > li.icon-db-link > div > a').text();
var description = $('table > tbody > tr:nth-child(1) > td > table:nth-child(2) > tbody > tr > td > span').text();

`
${spellName.toUpperCase().replace(/[^A-Z ]/g, '').replace(/ /g, '_')}_TALENT: {
  id: ${spellId},
  name: '${spellName.replace(/'/g, "\\'")}',
  icon: '${icon}',
  description: '${description.replace(/'/g, "\\'")}',
},
`;
*/

export default {
  // Paladin:
  // Holy Paladin:
  // lv15
  BESTOW_FAITH_TALENT: {
    id: 223306,
    name: 'Bestow Faith',
    icon: 'ability_paladin_blessedmending',
    description: '<a href="http://www.wowhead.com/spell=223306" target="_blank">Bestow Faith</a> is the default choice for most encounters in raids. The 5-second delay requires foresight, but this ability gives great healing for a very low mana cost. ',
  },
  LIGHTS_HAMMER_TALENT: {
    id: 114158,
    name: 'Light\'s Hammer',
    icon: 'spell_paladin_lightshammer',
    description: 'Unfortunately <a href="http://www.wowhead.com/spell=114158" target="_blank">Light\'s Hammer</a> isn\'t as good of a choice as it may seem. Even if you can use it on cooldown and it doesn\'t overheal <a href="http://www.wowhead.com/spell=223306" target="_blank">Bestow Faith</a> will outperform it in all situations. Primarily due to its low mana cost and beacon transfer(s). For this reason it is not recommended to take Light\'s Hammer.',
  },
  CRUSADERS_MIGHT_TALENT: {
    id: 196926,
    name: 'Crusader\'s Might',
    icon: 'ability_paladin_swiftretribution',
    description: 'Unfortunately <a href="http://www.wowhead.com/spell=196926" target="_blank">Crusader\'s Might</a> is usually only viable with a unique playstyle that does not work well with the T19 4 set bonus. For this reason it is not recommended to take Crusader\'s Might.',
  },
  // lv30
  CAVALIER_TALENT: {
    id: 230332,
    name: 'Cavalier',
    icon: 'ability_paladin_divinesteed',
    description: 'You can take <a href="http://www.wowhead.com/spell=230332" target="_blank">Cavalier</a> if most of the raid is clumped together and you won\'t need <a href="http://www.wowhead.com/spell=214202" target="_blank">Rule of Law</a>, or if you have a specific need for two charges of Divine Steed. It\'s important to understand that two charges doesn\'t actually mean you get twice as many uses of Divine Steed. If you use both charges at once, only one will recharge at a time meaning it will take 90 seconds for you to have both charges up again.',
  },
  UNBREAKABLE_SPIRIT_TALENT: {
    id: 114154,
    name: 'Unbreakable Spirit',
    icon: 'spell_holy_unyieldingfaith',
    description: '<a href="http://www.wowhead.com/spell=114154" target="_blank">Unbreakable Spirit</a> is almost never a valid choice.',
  },
  RULE_OF_LAW_TALENT: {
    id: 214202,
    name: 'Rule of Law',
    icon: 'ability_paladin_longarmofthelaw',
    description: 'Rule of Law is the default choice for raiding. Because the cooldown is so short, you should try to use it with <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a> as often as you can. Rule of Law is also extremely helpful for healing targets if they happen to be out of range and need healing e.g.: running out with a debuff.',
  },
  // lv45
  FIST_OF_JUSTICE_TALENT_HOLY: {
    id: 198054,
    name: 'Fist of Justice',
    icon: 'spell_holy_fistofjustice',
    description: 'The talent selected in this tier usually has no impact in raids.',
  },
  REPENTANCE_TALENT: {
    id: 20066,
    name: 'Repentance',
    icon: 'spell_holy_prayerofhealing',
    description: 'The talent selected in this tier usually has no impact in raids.',
  },
  BLINDING_LIGHT_TALENT: {
    id: 115750,
    name: 'Blinding Light',
    icon: 'ability_paladin_blindinglight',
    description: 'The talent selected in this tier usually has no impact in raids.',
  },
  // lv60
  DEVOTION_AURA_TALENT: {
    id: 183425,
    name: 'Devotion Aura',
    icon: 'spell_holy_devotionaura',
    description: '<a href="http://www.wowhead.com/spell=183425" target="_blank">Devotion Aura</a> and <a href="http://www.wowhead.com/spell=183415" target="_blank">Aura of Mercy</a> are both situationally good. Devotion Aura is the best choice to mitigate damage from any heavy-hitting boss mechanic. If you won\'t need the damage reduction from Devotion Aura, then you should take Aura of Mercy as it will result in more overall healing.',
  },
  AURA_OF_SACRIFICE_TALENT: {
    id: 183416,
    name: 'Aura of Sacrifice',
    icon: 'ability_deathwing_bloodcorruption_earth',
    description: '<a href="http://www.wowhead.com/spell=183416" target="_blank">Aura of Sacrifice</a> works as a decent raid cooldown with <a href="http://www.wowhead.com/spell=31821" target="_blank">Aura Mastery</a>. It is best to use it during <a href="http://www.wowhead.com/spell=31842" target="_blank">Avenging Wrath</a> and/or <a href="http://www.wowhead.com/spell=105809" target="_blank">Holy Avenger</a>. For this reason it is more situationally useful as not all encounters work out such that you can line up all your cool downs at once, and have it not be wasted. *note* healing done by <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a> does not transfer through Aura of Sacrifice\'s empowered effect.',
  },
  AURA_OF_MERCY_TALENT: {
    id: 183415,
    name: 'Aura of Mercy',
    icon: 'spell_holy_blessedlife',
    description: '<a href="http://www.wowhead.com/spell=183425" target="_blank">Devotion Aura</a> and <a href="http://www.wowhead.com/spell=183415" target="_blank">Aura of Mercy</a> are both situationally good. Devotion Aura is the best choice to mitigate damage from any heavy-hitting boss mechanic. If you won\'t need the damage reduction from Devotion Aura, then you should take Aura of Mercy as it will result in more overall healing.',
  },
  // lv75
  DIVINE_PURPOSE_TALENT_HOLY: {
    id: 197646,
    name: 'Divine Purpose',
    icon: 'spell_holy_divinepurpose',
    description: '<a href="http://www.wowhead.com/spell=197646" target="_blank">Divine Purpose</a> provides a small chance for a free Holy Shock or Light of Dawn, which saves mana by not having to cast something that consumes mana. The downside to Divine Purpose is that it is not very reliable, unlike <a href="http://www.wowhead.com/spell=105809" target="_blank">Holy Avenger</a>. This tier is mostly preference.',
  },
  HOLY_AVENGER_TALENT: {
    id: 105809,
    name: 'Holy Avenger',
    icon: 'ability_paladin_holyavenger',
    description: '<a href="http://www.wowhead.com/spell=105809" target="_blank">Holy Avenger</a> provides a lot of on-demand healing. The downside to Holy Avenger is that is requires fairly heavy mana usage to be effective. This tier is mostly preference.',
  },
  HOLY_PRISM_TALENT: {
    id: 114165,
    name: 'Holy Prism',
    icon: 'spell_paladin_holyprism',
    description: '<a href="http://www.wowhead.com/spell=114165" target="_blank">Holy Prism</a> provides you another AoE heal similar to <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a>. It doesn\'t heal for a lot while it\'s mana cost is fairly high, so it is usually not recommended to pick this talent. This tier is mostly preference.',
  },
  // lv90
  FERVENT_MARTYR_TALENT: {
    id: 196923,
    name: 'Fervent Martyr',
    icon: 'ability_paladin_selflesshealer',
    description: 'https://www.youtube.com/watch?v=WWaLxFIVX1s',
  },
  SACTIFIED_WRATH_TALENT: {
    id: 53376,
    name: 'Sactified Wrath',
    icon: 'ability_paladin_sanctifiedwrath',
    description: 'Only take <a href="http://www.wowhead.com/spell=53376" target="_blank">Sanctified Wrath</a> if a fight really requires burst healing, otherwise <a href="http://www.wowhead.com/spell=183778" target="_blank">Judgment of Light</a> is always the better choice (especially with <a href="http://www.wowhead.com/item=137086" target="_blank" class="legendary">Chain of Thrayn</a>).',
  },
  JUDGMENT_OF_LIGHT_TALENT: {
    id: 183778,
    name: 'Judgment of Light',
    icon: 'spell_holy_divineprovidence',
    description: '<a href="http://www.wowhead.com/spell=183778" target="_blank">Judgment of Light</a> is the default choice in this tier as it does a lot of consistent healing.',
  },
  // lv100
  BEACON_OF_FAITH_TALENT: {
    id: 156910,
    name: 'Beacon of Faith',
    icon: 'ability_paladin_beaconsoflight',
    description: '<a href="http://www.wowhead.com/spell=156910" target="_blank">Beacon of Faith</a> is excellent when both tanks are taking damage; specifically if there are a lot of adds that the off-tank has to pick up, or on any fight where the boss cleaves onto both tanks. In the Nighthold this is the best default choice.',
  },
  BEACON_OF_THE_LIGHTBRINGER_TALENT: {
    id: 197446,
    name: 'Beacon of the Lightbringer',
    icon: 'spell_paladin_clarityofpurpose',
    description: '<a href="http://www.wowhead.com/spell=197446" target="_blank">Beacon of the Lightbringer</a> only provides a single beacon so requires you to manage swapping your Beacon onto the tank that is taking damage. The upside is that it increases your mastery effectiveness and the healing of <a href="http://www.wowhead.com/spell=85222" target="_blank">Light of Dawn</a>. In the Nighthold there is rarely a good reason to pick this talent over <a href="http://www.wowhead.com/spell=156910" target="_blank">Beacon of Faith</a>.',
  },
  BEACON_OF_VIRTUE_TALENT: {
    id: 200025,
    name: 'Beacon of Virtue',
    icon: 'ability_paladin_beaconofinsight',
    description: '<a href="http://www.wowhead.com/spell=200025" target="_blank">Beacon of Virtue</a> is rarely a good choice in raids. It requires you to use a Global Cooldown to apply to random targets and costs a considerable amount of mana.',
  },
  // Retribution Paladin:
  // lv15
  FINAL_VERDICT_TALENT: {
    id: 198038,
    name: 'Final Verdict',
    icon: 'spell_paladin_templarsverdict',
    description: 'Increases the damage done by Templar\'s Verdict by 20%, and the damage done by Divine Storm by 10%.',
  },
  EXECUTION_SENTENCE_TALENT: {
    id: 213757,
    name: 'Execution Sentence',
    icon: 'spell_paladin_executionsentence',
    description: 'A hammer slowly falls from the sky, dealing (1450% of Attack power) Holy damage after 7 sec.',
  },
  CONSECRATION_TALENT: {
    id: 205228,
    name: 'Consecration',
    icon: 'spell_holy_innerfire',
    description: 'Consecrates the land beneath you, causing [(30% of Attack power) * 12] Holy damage over 12 sec to enemies who enter the area.',
  },
  // lv30
  THE_FIRES_OF_JUSTICE_TALENT: {
    id: 203316,
    name: 'The Fires of Justice',
    icon: 'spell_holy_crusaderstrike',
    description: 'Reduces the cooldown of Crusader Strike by 1.0 sec and gives it a 15% chance to reduce the cost of your next damaging or healing Holy Power ability by 1.',
  },
  ZEAL_TALENT: {
    id: 217020,
    name: 'Zeal',
    icon: 'spell_holy_sealofblood',
    description: 'Strike the target for 320% Physical damage. Maximum 2 charges. Grants Zeal, causing Zeal attacks to chain to an additional nearby target per stack. Maximum 3 stacks. Each jump deals 40% less damage.',
  },
  GREATER_JUDGMENT_TALENT: {
    id: 218178,
    name: 'Greater Judgment',
    icon: 'spell_holy_righteousfury',
    description: 'Your Judgment ability hits 2 additional nearby enemies, and always deals a critical strike against targets above 50% health.',
  },
  // lv45
  FIST_OF_JUSTICE_TALENT_RETRI: {
    id: 234299,
    name: 'Fist of Justice',
    icon: 'spell_holy_fistofjustice',
    description: 'Each Holy Power spent reduces the remaining cooldown on Hammer of Justice by 2.5 sec.',
  },
  // Repentance is shared
  // Blinding Light is shared
  // lv60
  VIRTUES_BLADE_TALENT: {
    id: 202271,
    name: 'Virtue\'s Blade',
    icon: 'ability_paladin_bladeofjustice',
    description: 'Blade of Justice critical strikes now deal 3 times normal damage.',
  },
  BLADE_OF_WRATH_TALENT: {
    id: 231832,
    name: 'Blade of Wrath',
    icon: 'ability_paladin_bladeofjusticeblue',
    description: 'Your auto attacks have a chance to reset the cooldown of Blade of Justice.',
  },
  DIVINE_HAMMER_TALENT: {
    id: 198034,
    name: 'Divine Hammer',
    icon: 'classicon_paladin',
    description: 'Divine Hammers spin around you, damaging enemies within 8 yds for 90% Holy damage instantly and every 2 sec for 12 sec.',
  },
  // lv75
  JUSTICARS_VENGEANCE_TALENT: {
    id: 215661,
    name: 'Justicar\'s Vengeance',
    icon: 'spell_holy_retributionaura',
    description: 'A weapon strike that deals (800% of Attack power) Holy damage and restores health equal to the damage done. Deals 100% additional damage and healing when used against a stunned target.',
  },
  EYE_FOR_AN_EYE_TALENT: {
    id: 205191,
    name: 'Eye for an Eye',
    icon: 'spell_paladin_inquisition',
    description: 'Reduces Physical damage you take by 35%, and instantly counterattacks any enemy that strikes you in melee combat for 170% Physical damage.  Lasts 10 sec.',
  },
  WORD_OF_GLORY_TALENT: {
    id: 210191,
    name: 'Word of Glory',
    icon: 'inv_helmet_96',
    description: 'Heal yourself and up to 5 friendly targets within 15 yards for (1200% of Spell power). Maximum 2 charges.',
  },
  // lv90
  DIVINE_INTERVENTION_TALENT: {
    id: 213313,
    name: 'Divine Intervention',
    icon: 'spell_nature_timestop',
    description: 'Reduces your Divine Shield cooldown by 20%.  In addition, any attack which would kill you instead reduces you to 20% of your maximum health and triggers Divine Shield. Cannot occur while Divine Shield is on cooldown or Forbearance is active.',
  },
  // Cavalier is shared
  // Judgment of Light is shared
  // lv100
  DIVINE_PURPOSE_TALENT_RETRI: {
    id: 223817,
    name: 'Divine Purpose',
    icon: 'spell_holy_divinepurpose',
    description: 'Your Holy Power spending abilities have a 20% chance to make your next Holy Power spending ability free.',
  },
  CRUSADE_TALENT: {
    id: 231895,
    name: 'Crusade',
    icon: 'ability_paladin_sanctifiedwrath',
    description: 'Increases your damage and haste by 3.0% for 20 sec. Each Holy Power spent during Crusade increases damage and haste by an additional 3.0%. Maximum 15 stacks.',
  },
  HOLY_WRATH: {
    id: 210220,
    name: 'Holy Wrath',
    icon: 'spell_holy_vindication',
    description: 'Deals 200% of your missing health in Holy damage to 4 nearby enemies, up to 120% of your maximum health. Deals 35% of missing health against enemy players.',
  },

  // Priest:
  // Discipline Priest:
  // lv15
  THE_PENITENT_TALENT: {
    id: 200347,
    name: 'The Penitent',
    icon: 'spell_priest_finalprayer',
    description: 'Penance may be cast on a friendly target, healing them for [(300% of Spell power) * 3] over 2 sec.',
  },
  CASTIGATION_TALENT: {
    id: 193134,
    name: 'Castigation',
    icon: 'spell_holy_searinglightpriest',
    description: 'Penance fires one additional bolt of holy light over its duration.',
  },
  SCHISM_TALENT: {
    id: 214621,
    name: 'Schism',
    icon: 'spell_warlock_focusshadow',
    description: 'Attack the enemy\'s soul with a surge of Shadow energy, dealing (425% of Spell power) Shadow damage and increasing damage that you deal to the target by 30% for 6 sec.',
  },
  // lv30
  ANGELIC_FEATHER_TALENT: {
    id: 121536,
    name: 'Angelic Feather',
    icon: 'ability_priest_angelicfeather',
    description: 'Places a feather at the target location, granting the first ally to walk through it 40% increased movement speed for 5 sec. Only 3 feathers can be placed at one time.  Maximum 3 charges.',
  },
  BODY_AND_SOUL_TALENT: {
    id: 64129,
    name: 'Body and Soul',
    icon: 'spell_holy_symbolofhope',
    description: 'Power Word: Shield  Shadowincreases Disciplineand Leap of Faith increase your target\'s movement speed by 40% for 3 sec.',
  },
  MASOCHISM_TALENT: {
    id: 193063,
    name: 'Masochism',
    icon: 'spell_shadow_misery',
    description: 'When you cast Shadow Mend on yourself, its damage over time effect heals you instead, and reduces all damage you take by 10%.',
  },
  // lv45
  SHINING_FORCE_TALENT: {
    id: 204263,
    name: 'Shining Force',
    icon: 'ability_paladin_blindinglight2',
    description: 'Creates a burst of light around a friendly target, knocking away nearby enemies and slowing their movement speed by 70% for 3 sec.3 seconds remaining',
  },
  PSYCHIC_VOICE_TALENT: {
    id: 196704,
    name: 'Psychic Voice',
    icon: 'spell_shadow_psychichorrors',
    description: 'Reduces the cooldown of Psychic Scream by 30 sec.',
  },
  DOMINANT_MIND_TALENT: {
    id: 205367,
    name: 'Dominant Mind',
    icon: 'spell_priest_void-flay',
    description: 'You may also control your own character while Mind Control is active, but Mind Control has a 2 min cooldown, and it may not be used against players.',
  },
  // lv60
  POWER_WORD_SOLACE_TALENT: {
    id: 129250,
    name: 'Power Word: Solace',
    icon: 'ability_priest_flashoflight',
    description: 'Strikes an enemy with heavenly power, dealing (300% of Spell power) Holy damage and restoring 1.00% of your maximum mana.',
  },
  SHIELD_DISCIPLINE_TALENT: {
    id: 197045,
    name: 'Shield Discipline',
    icon: 'spell_holy_divineprotection',
    description: 'When your Power Word: Shield is completely absorbed you instantly regenerate 1% of your maximum mana.',
  },
  MINDBENDER_TALENT: {
    id: 123040,
    name: 'Mindbender',
    icon: 'spell_shadow_soulleech_3',
    manaCost: 0,
    description: 'Summons a Mindbender to attack the target for 12 sec. You regenerate 0.50% of maximum mana each time the Mindbender attacks.',
  },
  // lv75
  CONTRITION_TALENT: {
    id: 197419,
    name: 'Contrition',
    icon: 'ability_priest_savinggrace',
    description: 'Increases Atonement duration by 3 sec.',
  },
  POWER_INFUSION_TALENT: {
    id: 10060,
    name: 'Power Infusion',
    icon: 'spell_holy_powerinfusion',
    description: 'Infuses you with power for 20 sec, increasing haste by 25% Shadowand increasing Insanity generation by 25% Disciplineand reducing the mana cost of all spells by 20%20 seconds remaining',
  },
  TWIST_OF_FATE_TALENT: {
    id: 109142,
    name: 'Twist of Fate',
    icon: 'spell_shadow_mindtwisting',
    description: 'After  Shadowdamaging Disciplinehealing a target below 35% health, you deal 20% increased damage and 20% increased healing for 10 sec.',
  },
  // lv90
  CLARITY_OF_WILL_TALENT: {
    id: 152118,
    name: 'Clarity of Will',
    icon: 'ability_priest_clarityofwill',
    description: 'Shields the target with a protective ward for 20 sec, absorbing [Spell power * 9 * (1 + Versatility)] damage.20 seconds remaining',
  },
  DIVINE_STAR_TALENT: {
    id: 110744,
    name: 'Divine Star',
    icon: 'spell_priest_divinestar',
    description: 'Throw a Divine Star forward 24 yds, healing allies in its path for (90% of Spell power) and dealing (145% of Spell power) Holy damage to enemies. After reaching its destination, the Divine Star returns to you, healing allies and damaging enemies in its path again.',
  },
  HALO_TALENT: {
    id: 120517,
    name: 'Halo',
    icon: 'ability_priest_halo',
    manaCost: 39600,
    description: 'Creates a ring of Holy energy around you that quickly expands to a 30 yd radius, healing allies for (287.4% of Spell power) and dealing (431.1% of Spell power) Holy damage to enemies.',
  },
  // lv100
  PURGE_THE_WICKED_TALENT: {
    id: 204197,
    name: 'Purge the Wicked',
    icon: 'ability_mage_firestarter',
    manaCost: 22000,
    description: 'Cleanses the target with fire, causing (100% of Spell power) Fire damage and an additional (480% of Spell power) Fire damage over 20 sec. Spreads to an additional nearby enemy when you cast Penance on the target.',
  },
  GRACE_TALENT: {
    id: 200309,
    name: 'Grace',
    icon: 'spell_holy_hopeandgrace',
    description: 'Increases your non-Atonement healing and absorption by 30% on targets with Atonement.',
  },
  SHADOW_COVENANT_TALENT: {
    id: 204065,
    name: 'Shadow Covenant',
    icon: 'spell_shadow_summonvoidwalker',
    description: 'Draws on the power of shadow to heal up to 5 injured allies within 30 yds of the target for (450% of Spell power), but leaves a shell on them that absorbs the next [(450% of Spell power) * 50 / 100] healing they receive within 6 sec.',
  },

  // Druid:
  // Resto Druid:
  // lv15
  PROSPERITY_TALENT: {
    id: 200383,
    name: 'Prosperity',
    icon: 'spell_druid_prosperity',
    description: 'Unfortunately <a href="http://www.wowhead.com/spell=200383" target="_blank">Properity</a> is right now shit tier, please dont use it for raids. ',
  },
  CENARION_WARD_TALENT: {
    id: 102351,
    name: 'Cenarion Ward',
    icon: 'ability_druid_naturalperfection',
    description: '<a href="http://www.wowhead.com/spell=102351" target="_blank">Cenarion Ward</a> is the best talent in this tier in almost all situations.'
  },
  ABUNDANCE_TALENT: {
    id: 207383,
    name: 'Abundance',
    icon: 'spell_druid_abundance',
    description: '<a href="http://www.wowhead.com/spell=207383" target="_blank">Abundance</a> is usually not a recommended talent for raiding, however it\'s decent for M+ dungeons',
  },
  // lv30
  RENEWAL_TALENT: {
    id: 108238,
    name: 'Renewal',
    icon: 'spell_druid_renewal',
    description: '<a href="http://www.wowhead.com/spell=108238" target="_blank">Renewal</a> is a big self-heal on a long-ish cooldown which is off the global cooldown. This talent is usualy not chosen because the lack of movement utility <a href="http://www.wowhead.com/spell=108238" target="_blank">Displacer Beast</a> offer is better.'
  },
  DISPLACER_BEAST_TALENT: {
    id: 102280,
    name: 'Displacer Beast',
    icon: 'spell_druid_displacement',
    description: '<a href="http://www.wowhead.com/spell=108238" target="_blank">Displacer Beast</a> is the default choice for this tier. Basically a Blink with kitty Spring tagged onto the end.',
  },
  WILD_CHARGE_TALENT: {
    id: 102401,
    name: 'Wild Charge',
    icon: 'spell_druid_wildcharge',
    description: '<a href="http://www.wowhead.com/spell=102401" target="_blank">Wild Charge</a> is usually worse than Displacer Bear when it comes to movement utility. Why are you using Wild Charge?????',
  },
  // lv45
  BALANCE_AFFINITY_TALENT: {
    id: 197632,
    name: 'Balance Affinity',
    icon: 'spell_druid_balanceaffinity',
    description: '<a href="http://www.wowhead.com/spell=197632" target="_blank">Balance Affinity</a> is useful whenever you need the extra passive 5 yard range increase. However it offers less DPS than <a href="http://www.wowhead.com/spell=197490" target="_blank">Feral Affinity</a> .',
  },
  FERAL_AFFINITY_TALENT: {
    id: 197490,
    name: 'Feral Affinity',
    icon: 'spell_druid_feralaffinity',
    description: '<a href="http://www.wowhead.com/spell=197490" target="_blank">Feral Affinity</a> offers passive 15% movement speed, however it offers the highest DPS by <a href="https://questionablyepic.com/restodruid-catweaving/" target="_blank">catweaving</a>. This talent is usually only taken if you need the extra dps.',
  },
  GUARDIAN_AFFINITY_TALENT: {
    id: 197491,
    name: 'Guardian Affinity',
    icon: 'talentspec_druid_feral_bear',
    description: '<a href="http://www.wowhead.com/spell=197491" target="_blank">Guardian Affinity</a> offers a flat 6% damage taken reduction. It also gives you <a href="http://www.wowhead.com/spell=22842" target="_blank">Frenzied Regeneration</a> which can be life saving (or good for padding healing). This is usually the default talent, great choice!',
  },
  // lv60
  MIGHTY_BASH_TALENT: {
    id: 5211,
    name: 'Mighty Bash',
    icon: 'spell_druid_mightybash',
    description: 'This talent row usually has no impact on performance. This can be useful on encounters with bigger adds that you can stun or procc Sephuz Secret with',
  },
  MASS_ENTANGLEMENT_TALENT: {
    id: 102359,
    name: 'Mass Entanglement',
    icon: 'spell_druid_massentanglement',
    description: 'This talent row usually has no impact on performance. This can be useful if you need a spell to procc Sephuz Secret with',
  },
  TYPHOON_TALENT: {
    id: 132469,
    name: 'Typhoon',
    icon: 'ability_druid_typhoon',
    description: 'This talent row usually has no impact on performance. This can be useful if you need a spell to push adds e.g. Illgynoth blobs.',
  },
  // lv75
  SOUL_OF_THE_FOREST_TALENT: {
    id: 158478,
    name: 'Soul of the Forest',
    icon: 'spell_druid_souloftheforest',
    description: 'You should not at any point use this talent right now. <a href="http://www.wowhead.com/spell=158478" target="_blank">Soul of the Forest</a> is unfortunately mathematically inferior to both <a href="http://www.wowhead.com/spell=200390" target="_blank">Cultivation</a> and <a href="http://www.wowhead.com/spell=33891" target="_blank">Tree of Life</a>.',
  },
  CULTIVATION_TALENT: {
    id: 200390,
    name: 'Cultivation',
    icon: 'ability_druid_nourish',
    description: 'This is usualy the default talent. <a href="http://www.wowhead.com/spell=200390" target="_blank">Cultivation</a> provides a free passive HoT on players actually needing heal (sub 60% hp), it also increases the overall average mastery count on players. It is also the easiest talent to play with.',
  },
  INCARNATION_TREE_OF_LIFE_TALENT: {
    id: 33891,
    name: 'Incarnation: Tree of Life',
    icon: 'spell_druid_tol',
    description: '<a href="http://www.wowhead.com/spell=33891" target="_blank">Incarnation: Tree of Life</a> or simply ToL. This talent has actually been proven to be a decent or sometimes a superior choice to <a href="http://www.wowhead.com/spell=200390" target="_blank">Cultivation</a>. This talent requires some planning to be used optimally. You have to take into account the 3 minute cooldown and plan accordingly, e.g. a 2.30 minute fight you would only be able to use this ability once, but on a 3.30 minute fight you would get 2 active uses. ToL is also preferred whenever people rarely drop below 60% hp or/and you need the on demand burst healing. With the nerfs coming to cultivation in 7.2.5 this might actually be the default pick.',
  },
  // lv90
  SPRING_BLOSSOMS_TALENT: {
    id: 207385,
    name: 'Spring Blossoms',
    icon: 'spell_druid_springblossoms',
    description: 'A good talent for some encounters. Spring blossom counts as a mastery stack and can be extended by <a href="http://www.wowhead.com/spell=197721" target="_blank">Flourish</a> and a well placed spring blossoms can give you around 9-12 extra mastery stacks up (depending on your haste). This talent requires some planning to get optimal value as you would need to have a high uptime (>90%) on <a href="http://www.wowhead.com/spell=145205" target="_blank">Efflorescence</a> and your raid members being grouped up most the time.',
  },
  INNER_PEACE_TALENT: {
    id: 197073,
    name: 'Inner Peace',
    icon: 'spell_druid_innerpeace',
    description: 'This talent requires some planning with your healing team to optimize. Useful if you can get a few extra good tranquilities in, useless otherwise.',
  },
  GERMINATION_TALENT: {
    id: 155675,
    name: 'Germination',
    icon: 'spell_druid_germination',
    description: 'This talent shines on encounters where you need to have extra focus on specific targets. Also if you have the T19 4P and <a href="http://www.wowhead.com/item=137072/amanthuls-wisdom" target="_blank">Amanthuls Wisdom</a> this will most likely be your default talent choice.',
  },
  // lv100
  MOMENT_OF_CLARITY_TALENT: {
    id: 155577,
    name: 'Moment of Clarity',
    icon: 'spell_druid_momentofclarity',
    description: 'You are either a Korean meme-lord or you dont know how to play this game, avoid this talent.',
  },
  STONEBARK_TALENT: {
    id: 197061,
    name: 'Stonebark',
    icon: 'spell_druid_stonebark',
    description: 'This is a weak talent for raiding and you should not be using this, please stop using this.',
  },
  FLOURISH_TALENT: {
    id: 197721,
    name: 'Flourish',
    icon: 'spell_druid_wildburst',
    description: 'Default top tier talent, use it and love it. Always aim to extend <a href="http://www.wowhead.com/spell=48438" target="_blank">Wild Growth</a> and <a href="http://www.wowhead.com/spell=102351" target="_blank">Cenarion Ward</a>.',
  },

  // Mistweaver Monk Talents
  // Note: Descriptions have been pulled from the WoWHead guide, written by Garg.
  // Level 15
  CHI_BURST_TALENT: {
    id: 123986,
    name: 'Chi Burst',
    icon: 'spell_arcane_arcanetorrent',
    description: 'Chi Burst is an excellent raid healing spell. It does moderate healing for no mana, so you should try to use it often. This should be your default choice for raiding.',
  },
  ZEN_PULSE_TALENT: {
    id: 124081,
    name: 'Zen Pulse',
    icon: 'ability_monk_forcesphere',
    description: 'Zen Pulse can be a really strong single target heal if there are multiple enemies near the target. This is a great spell for dungeons since there are almost always many enemies surrounding your tank and melee.',
  },
  CHI_WAVE_TALENT: {
    id: 115098,
    name: 'Chi Wave',
    icon: 'ability_monk_chiwave',
    description: 'Chi Wave does less healing and damage than  Chi Burst and  Zen Pulse with multiple mobs around a single target. However,  Chi Wave is useful when doing solo content as a Msitweaver.',
  },
  // Level 30
  CHI_TORPEDO_TALENT: {
    id: 115008,
    name: 'Chi Torpedo',
    icon: 'ability_monk_quitornado',
    description: 'Chi Torpedo replaces  Roll and causes you to go farther, as well as increasing your movement speed after casting it. This can be a really strong burst movement choice or if you just enjoy the way it looks.',
  },
  TIGERS_LUST_TALENT: {
    id: 116841,
    name: 'Tiger\'s Lust',
    icon: 'ability_monk_tigerslust',
    description: 'Tiger\'s Lust tends to be the raider\'s go-to choice since it has an extra bonus of being able to remove roots and snares, which can counter some boss mechanics, saving mana on dispells. Otherwise, an on-demand sprint is generally a strong thing to have.',
  },
  CELERITY_TALENT: {
    id: 115173,
    name: 'Celerity',
    icon: 'ability_monk_quipunch',
    description: 'Celerity lets you  Roll more often which can be useful if you have a more frequent need for extra mobility.',
  },
  // Level 45
  LIFECYCLES_TALENT: {
    id: 197915,
    name: 'Lifecycles',
    icon: 'ability_monk_souldance',
    description: 'Lifecycles saves mana whenever you alternate casts of  Enveloping Mist and  Vivify. This encourages using more  Enveloping Mist than is usually needed in raids, which can make this talent amount to a healing loss if not used properly.  Lifecycles is a good choice for when there\'s both consistent single target damage and group damage in a raid.',
  },
  SPIRIT_OF_THE_CRANE_TALENT: {
    id: 210802,
    name: 'Spirit of the Crane',
    icon: 'monk_stance_redcrane',
    description: 'Spirit of the Crane is one of two talents in the tree that allow your damaging abilities to help your healing. This is commonly referred to as Fistweaving.   Spirit of the Crane is regarded as the best talent in the row for sustaining and regenerating your mana, but at the cost of needing downtime between healing, as well as using almost never Soothing Mist in order to maximize mana return. ',
  },
  MIST_WRAP_TALENT: {
    id: 197900,
    name: 'Mist Wrap',
    icon: 'ability_monk_pathofmists',
    description: 'Mist Wrap is an amazing choice for dungeons as it not only increases the effectiveness of one of your main dungeon spells,  Enveloping Mist, but it also allows you to cast  Soothing Mist while moving. Can be used in raiding when the fights aren\'t suitable for  Lifecycles or  Spirit of the Crane.',
  },
  // Level 60
  RING_OF_PEACE_TALENT: {
    id: 116844,
    name: 'Ring of Peace',
    icon: 'spell_monk_ringofpeace',
    description: 'Ring of Peace, and knockbacks used in PvE, have generally niche uses in fights. Whether you use it to speed up adds that need to get somewhere quickly, or if you need to protect your tank while you heal them up from a particularly nasty trash pack.',
  },
  SONG_OF_CHIJI_TALENT: {
    id: 198898,
    name: 'Song of Chi-Ji',
    icon: 'inv_chaos_orb',
    description: 'Song of Chi-Ji is in a similar position to  Ring of Peace, but for different reasons. There is very little non-stun crowd control used in raids and even in dungeons the short duration (20 seconds) often is not worth having over the other option in this talent row. Could potentially be used in very niche situations where multiple adds must be controlled, but only for a brief amount of time.',
  },
  LEG_SWEEP_TALENT: {
    id: 119381,
    name: 'Leg Sweep',
    icon: 'ability_monk_legsweep',
    description: 'Leg Sweep is the go-to choice for this talent tier. Stuns are widely used in both raids and dungeons and an AoE, 5-second stun with a 45 second cooldown is a welcome addition to most groups.',
  },
  // Level 75
  HEALING_ELIXIR_TALENT: {
    id: 122280,
    name: 'Healing Elixir',
    icon: 'ability_monk_jasmineforcetea',
    description: 'Healing Elixir, with two charges and a 30-second cooldown, you will want to use this often to save your and other healers\' mana. This can be a great default choice for any situation, however by taking it you leave yourself with no personal damage reduction cooldown.',
  },
  DIFFUSE_MAGIC_TALENT: {
    id: 122783,
    name: 'Diffuse Magic',
    icon: 'spell_monk_diffusemagic',
    description: 'Diffuse Magic is still a strong defensive cooldown, but it no longer provides practical immunity to damage as it did before. This can be an excellent choice if you know you will take huge magical damage at predictable moments in a fight.',
  },
  DAMPEN_HARM_TALENT: {
    id: 122278,
    name: 'Dampen Harm',
    icon: 'ability_monk_dampenharm',
    description: 'Dampen Harm is good for the same reasons as Diffuse, but it will reduce all damage instead of just magic.   Dampen Harm is more versatile than  Diffuse Magic, but it\'s also less powerful.',
  },
  // Level 90
  REFRESHING_JADE_WIND_TALENT: {
    id: 196725,
    name: 'Refreshing Jade Wind',
    icon: 'ability_monk_rushingjadewind',
    description: 'Refreshing Jade Wind is a powerful burst healing tool that can be used to supplement your group healing when used in combination with Essence Font. There is a heavy cost on this ability, so it will require you to be much more aware of your mana management. If you are still learning the spec or feel like you are already struggling with your mana, this talent is not recommended.',
  },
  INVOKE_CHIJI_TALENT: {
    id: 198664,
    name: 'Invoke Chi-Ji, the Red Crane',
    icon: 'inv_pet_cranegod',
    description: 'Invoke Chi-Ji, the Red Crane is a free, sustained healing cooldown. With a 45-second duration, you would want to take this for situations where you will need to be healing the group or raid for extended periods of time. Chi-Ji will cast  Crane Heal, during which he will pick three targets to heal. This means he is extra powerful when the raid or group is clumped up or even just lightly spread out. He is the recommended talent for both dungeon and raid healing, as he helps smooth out incoming damage considerably.',
  },
  JADE_SERPENT_STATUE: {
    id: 115313,
    name: 'Summon Jade Serpent Statue',
    icon: 'ability_monk_summonserpentstatue',
    description: 'Summon Jade Serpent Statue is a good option if you\'re going to be doing mostly single target healing. It can be really good in dungeons if you find yourself struggling to keep the tank alive or if you\'re going to be the main tank healer in a raid. The statue will only channel on the targets that you begin your own  Soothing Mist channel on, but it will continue to channel its own  Soothing Mist if you cancel yours. It will continue that channel until the duration ends or you cast  Soothing Mist on another target.',
  },
  // Level 100
  MANA_TEA_TALENT: {
    id: 197908,
    name: 'Mana Tea',
    icon: 'monk_ability_cherrymanatea',
    description: 'Mana Tea is a good choice for healing periods of burst damage in raids by chain casting  Essence Font together. This is most powerful when used with high cost spells such as the  Essence Font and  Refreshing Jade Wind combo, or whenever you might be chain casting multiple spells in succession.',
  },
  FOCUSED_THUNDER_TALENT: {
    id: 197895,
    name: 'Focused Thunder',
    icon: 'spell_monk_nimblebrew',
    description: 'Focused Thunder gives your  Thunder Focus Tea an extra charge. This is the default choice in dungeons, as the extra charge will come in handy whenever you use  Thunder Focus Tea.',
  },
  RISING_THUNDER_TALENT: {
    id: 210804,
    name: 'Rising Thunder',
    icon: 'ability_thunderking_lightningwhip',
    description: 'Rising Thunder is the other talent that, allows our damaging abilities to help with out healing. When talented,  Rising Thunder causes your Rising Sun Kick to reset the cooldown of  Thunder Focus Tea. This can be very powerful as  Rising Sun Kick\'s cooldown is reduced by Haste. With  Rising Thunder, you\'ll be making much more frequent use of  Thunder Focus Tea, so it\'s important to quickly assess how you will use it depending on the situation. You don\'t have to take  Spirit of the Crane with  Rising Thunder and vice versa, but together they make a very powerful combination that can be a lot of fun. You\'ll want to be using  Rising Sun Kick, and thus  Thunder Focus Tea, as often as possible to get the most out of this talent.',
  },
};
