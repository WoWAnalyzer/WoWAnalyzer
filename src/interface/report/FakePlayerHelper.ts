import SPECS from 'game/SPECS';

export function fakePlayerInfoGenerator(player: any) {
  const fakedPlayer = player;
  fakedPlayer.gear = fakeGearGenerator(player.specID);
  fakedPlayer.auras = fakeBuffGenerator();
  fakedPlayer.error = null;
  return fakedPlayer;
}

//region Gear Generation
const CLOTH_SPECS = [SPECS.ARCANE_MAGE.id, SPECS.FIRE_MAGE.id, SPECS.FROST_MAGE.id, SPECS.DISCIPLINE_PRIEST.id, SPECS.HOLY_PRIEST.id, SPECS.SHADOW_PRIEST.id, SPECS.AFFLICTION_WARLOCK.id, SPECS.DEMONOLOGY_WARLOCK.id, SPECS.DESTRUCTION_WARLOCK.id];
const LEATHER_SPECS = [SPECS.BALANCE_DRUID.id, SPECS.FERAL_DRUID.id, SPECS.GUARDIAN_DRUID.id, SPECS.RESTORATION_DRUID.id, SPECS.ASSASSINATION_ROGUE.id, SPECS.OUTLAW_ROGUE.id, SPECS.SUBTLETY_ROGUE.id, SPECS.BREWMASTER_MONK.id, SPECS.WINDWALKER_MONK.id, SPECS.MISTWEAVER_MONK.id, SPECS.HAVOC_DEMON_HUNTER.id, SPECS.VENGEANCE_DEMON_HUNTER.id];
const MAIL_SPECS = [SPECS.BEAST_MASTERY_HUNTER.id, SPECS.MARKSMANSHIP_HUNTER.id, SPECS.SURVIVAL_HUNTER.id, SPECS.ELEMENTAL_SHAMAN.id, SPECS.ENHANCEMENT_SHAMAN.id, SPECS.RESTORATION_SHAMAN.id];
const PLATE_SPECS = [SPECS.HOLY_PALADIN.id, SPECS.PROTECTION_PALADIN.id, SPECS.RETRIBUTION_PALADIN.id, SPECS.ARMS_WARRIOR.id, SPECS.FURY_WARRIOR.id, SPECS.PROTECTION_WARRIOR.id, SPECS.BLOOD_DEATH_KNIGHT.id, SPECS.FROST_DEATH_KNIGHT.id, SPECS.UNHOLY_DEATH_KNIGHT.id];

const specificGearSets: { [key: number]: {} } = {
  62: [ //Arcane Mage
    { id: 163427, quality: 3, icon: 'ivn_helm_cloth_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177165, quality: 3, icon: 'inv_misc_necklace_shell07.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163425, quality: 3, icon: 'ivn_shoulder_cloth_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 163429, quality: 3, icon: 'ivn_chest_cloth_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163431, quality: 3, icon: 'ivn_belt_cloth_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177096, quality: 3, icon: 'ivn_pant_cloth_warfrontshorde_d_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177095, quality: 3, icon: 'ivn_boot_cloth_warfrontshorde_d_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177098, quality: 3, icon: 'ivn_bracer_cloth_warfrontshorde_d_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 173244, quality: 1, icon: 'inv_glove_cloth_kultirasquest_b_01.jpg', itemLevel: 200, bonusIDs: [6716, 6926, 6649, 6647] },
    { id: 177167, quality: 3, icon: 'inv_70_dungeon_ring4a.jpg', itemLevel: 200, bonusIDs: [6938, 1781] },
    { id: 177164, quality: 3, icon: 'inv_misc_60raid_ring_2d.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177155, quality: 3, icon: 'inv_misc_rune_02.jpg', itemLevel: 200, bonusIDs: [6938, 607] },
    { id: 177157, quality: 3, icon: 'inv_bijou_gold.jpg', itemLevel: 200, bonusIDs: [6938, 604] },
    { id: 163358, quality: 3, icon: 'ivn_cape_cloth_warfrontshorde_d_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177119, quality: 3, icon: 'inv_staff_2h_warfrontshorde_c_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
  ],
  71: [//Arms Warrior
    { id: 180900, quality: 4, icon: 'inv_helm_plate_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 177165, quality: 3, icon: 'inv_misc_necklace_shell07.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163454, quality: 3, icon: 'inv_plate_shoulder_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 180902, quality: 4, icon: 'inv_chest_plate_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 180924, quality: 4, icon: 'inv_belt_plate_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 180916, quality: 4, icon: 'inv_pant_plate_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 177112, quality: 3, icon: 'inv_plate_boot_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 180929, quality: 4, icon: 'inv_bracer_plate_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 180910, quality: 4, icon: 'inv_glove_plate_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 178926, quality: 1, icon: 'inv_jewelcrafting_80_maxlvlring_orange.jpg', itemLevel: 200, bonusIDs: [6716, 6961, 6649, 6648] },
    { id: 177167, quality: 3, icon: 'inv_70_dungeon_ring4a.jpg', itemLevel: 200, bonusIDs: [6938, 1754] },
    { id: 177154, quality: 3, icon: 'inv_6_2raid_trinket_2d.jpg', itemLevel: 200, bonusIDs: [6938, 607] },
    { id: 177156, quality: 3, icon: 'inv_misc_scales_dragongreen01.jpg', itemLevel: 200, bonusIDs: [6938, 607] },
    { id: 180941, quality: 4, icon: 'inv_cape_special_revendreth_d_03.jpg', itemLevel: 200 },
    { id: 181142, quality: 4, icon: 'inv_sword_2h_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
  ],
  253: [ //Beast Mastery Hunter
    { id: 163447, quality: 3, icon: 'inv_helm_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177165, quality: 3, icon: 'inv_misc_necklace_shell07.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163442, quality: 3, icon: 'inv_shoulder_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 177159, quality: 3, icon: 'inv_chest_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163452, quality: 3, icon: 'inv_belt_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177107, quality: 3, icon: 'inv_pant_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177109, quality: 3, icon: 'inv_boot_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 180930, quality: 4, icon: 'inv_bracer_mail_revendreth_d_01.jpg', itemLevel: 200 },
    { id: 177108, quality: 3, icon: 'inv_glove_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177164, quality: 3, icon: 'inv_misc_60raid_ring_2d.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177167, quality: 3, icon: 'inv_70_dungeon_ring4a.jpg', itemLevel: 200, bonusIDs: [6938, 1782] },
    { id: 177166, quality: 3, icon: 'inv_misc_rope_01.jpg', itemLevel: 200, bonusIDs: [6938, 607] },
    { id: 177158, quality: 3, icon: 'inv_misc_redsaberonfang.jpg', itemLevel: 200, bonusIDs: [6938, 605] },
    { id: 163365, quality: 3, icon: 'inv_cape_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177126, quality: 3, icon: 'inv_firearm_2h_warfrontshorde_c_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
  ],
  254: [ //Marksmanship Hunter
    { id: 172325, quality: 1, icon: 'inv_misc_desecrated_mailhelm.jpg', itemLevel: 200, bonusIDs: [6716, 7005, 6648, 6650] },
    { id: 177165, quality: 3, icon: 'inv_misc_necklace_shell07.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163442, quality: 3, icon: 'inv_shoulder_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 177159, quality: 3, icon: 'inv_chest_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163452, quality: 3, icon: 'inv_belt_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177107, quality: 3, icon: 'inv_pant_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177109, quality: 3, icon: 'inv_boot_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177100, quality: 3, icon: 'inv_bracer_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177108, quality: 3, icon: 'inv_glove_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177164, quality: 3, icon: 'inv_misc_60raid_ring_2d.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177167, quality: 3, icon: 'inv_70_dungeon_ring4a.jpg', itemLevel: 200, bonusIDs: [6938, 1782] },
    { id: 177166, quality: 3, icon: 'inv_misc_rope_01.jpg', itemLevel: 200, bonusIDs: [6938, 607] },
    { id: 177158, quality: 3, icon: 'inv_misc_redsaberonfang.jpg', itemLevel: 200, bonusIDs: [6938, 605] },
    { id: 163365, quality: 3, icon: 'inv_cape_mail_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177126, quality: 3, icon: 'inv_firearm_2h_warfrontshorde_c_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
  ],
  270: [ //Mistweaver Monk
    { id: 172317, quality: 1, icon: 'inv_misc_desecrated_leatherhelm.jpg', itemLevel: 200, bonusIDs: [6716, 7072, 6650, 6647] },
    { id: 177165, quality: 3, icon: 'inv_misc_necklace_shell07.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163433, quality: 3, icon: 'inv_shoulder_leather_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 174035, quality: 3, icon: 'inv_leather_warfrontshorde_d_01_chest.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 163440, quality: 3, icon: 'inv_buckle_leather_warfrontshorde_b_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177097, quality: 3, icon: 'inv_leather_warfrontshorde_d_01_pants.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177106, quality: 3, icon: 'inv_leather_warfrontshorde_b_01_boot.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177101, quality: 3, icon: 'inv_leather_warfrontshorde_d_01_bracer.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177105, quality: 3, icon: 'inv_leather_warfrontshorde_b_01_gloves.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177167, quality: 3, icon: 'inv_70_dungeon_ring4a.jpg', itemLevel: 200, bonusIDs: [6938, 1748] },
    { id: 177164, quality: 3, icon: 'inv_misc_60raid_ring_2d.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177157, quality: 3, icon: 'inv_bijou_gold.jpg', itemLevel: 200, bonusIDs: [6938, 607] },
    { id: 177155, quality: 3, icon: 'inv_misc_rune_02.jpg', itemLevel: 200, bonusIDs: [6938, 603] },
    { id: 163361, quality: 3, icon: 'inv_leather_warfrontshorde_b_01_cloak.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 177119, quality: 3, icon: 'inv_staff_2h_warfrontshorde_c_01.jpg', itemLevel: 200, bonusIDs: 6938 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
    { id: 0, quality: 1, icon: 'inv_axe_02.jpg', itemLevel: 0 },
  ],
};
const genericClothSet = specificGearSets[62]; //Setting Arcane Mage as a generic cloth fallback
const genericLeatherSet = specificGearSets[270]; //Setting Mistweaver Monk as a generic leather fallback
const genericMailSet = specificGearSets[254]; //Setting Marksmanship Hunter as a generic mail fallback
const genericPlateSet = specificGearSets[71]; //Setting Arms Warrior as a generic plate fallback

function fakeGearGenerator(spec: number) {
  if (specificGearSets[spec]) {
    return specificGearSets[spec];
  }
  console.warn('No specific gear set has been made for specID ' + spec + ', using a generic one');
  //If a specific set hasn't been
  if (CLOTH_SPECS.includes(spec)) {
    return genericClothSet;
  } else if (LEATHER_SPECS.includes(spec)) {
    return genericLeatherSet;
  } else if (MAIL_SPECS.includes(spec)) {
    return genericMailSet;
  } else if (PLATE_SPECS.includes(spec)) {
    return genericPlateSet;
  } else {
    console.warn('Unknown spec id passed to fakeGearGenerator.');
    return null;
  }
}

//endregion

//region Buff Generatior
function fakeBuffGenerator() {
  return [
    { source: 7, ability: 1459, stacks: 1, icon: 'spell_holy_magicalsentry.jpg', name: 'Arcane Intellect' },
    { source: 5, ability: 6673, stacks: 1, icon: 'ability_warrior_battleshout.jpg', name: 'Battle Shout' },
    { source: 13, ability: 21562, stacks: 1, icon: 'spell_holy_wordfortitude.jpg', name: 'Power Word: Fortitude' },
  ];
}

//endregion
