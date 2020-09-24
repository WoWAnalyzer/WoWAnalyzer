import SPECS from 'game/SPECS';
import { specificGearSets } from 'interface/report/CombatantInfoFakerGearsets';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SOULBINDS from 'game/shadowlands/SOULBINDS';
import { Conduit } from 'parser/core/Events';

const debugGear = false;
const debugCovenant = false;
const debugSoulbind = false;

export function generateFakeCombatantInfo(player: any) {
  const fakedPlayer = player;
  fakedPlayer.gear = fakeGearGenerator(player.specID);
  fakedPlayer.gear = fakeLegendaryGeneration(player.gear);
  fakedPlayer.auras = fakeBuffGenerator();
  fakedPlayer.covenant = fakeCovenantGenerator(player.specID);
  fakedPlayer.soulbind = fakeSoulbindGenerator(player.specID);
  fakedPlayer.conduits = fakeConduitGenerator();
  fakedPlayer.error = null;
  return fakedPlayer;
}

//region Shadowlands Systems

//region Covenant Generation

function fakeCovenantGenerator(specID: number) {
  const KYRIAN_SPECS: Array<Number> = [];
  const VENTHYR_SPECS: Array<Number> = [SPECS.MARKSMANSHIP_HUNTER.id];
  const NIGHT_FAE_SPECS: Array<Number> = [];
  const NECROLORD_SPECS: Array<Number> = [];

  if (VENTHYR_SPECS.includes(specID)) {
    return COVENANTS.VENTHYR;
  } else if (KYRIAN_SPECS.includes(specID)) {
    return COVENANTS.KYRIAN;
  } else if (NIGHT_FAE_SPECS.includes(specID)) {
    return COVENANTS.NIGHT_FAE;
  } else if (NECROLORD_SPECS.includes(specID)) {
    return COVENANTS.NECROLORD;
  } else {
    debugCovenant && console.warn('SpecID: ' + specID + ' passed - can\'t generate fake covenant for the spec - add it to a list in CombatantInfoFaker.ts');
    return null;
  }
}

//endregion

//region Soulbind Generation

function fakeSoulbindGenerator(specID: number) {
  //Kyrian Soulbinds
  const PELAGOS_SPECS: Array<Number> = [];
  const KLEIA_SPECS: Array<Number> = [];
  const FORGELITE_PRIME_MIKANIKOS_SPECS: Array<Number> = [];

  //Venthyr Soulbinds
  const GENERAL_DRAVEN_SPECS: Array<Number> = [];
  const NADJIA_THE_MISTBLADE_SPECS: Array<Number> = [];
  const THEOTAR_THE_MAD_DUKE_SPECS: Array<Number> = [];

  //Night Fae Soulbinds
  const NIYA_SPECS: Array<Number> = [];
  const DREAMWEAVER_SPECS: Array<Number> = [];
  const KORAYN_SPEC: Array<Number> = [];

  //Necrolord Soulbinds
  const PLAGUE_DEVISER_MARILETH_SPECS: Array<Number> = [];
  const EMENI_SPECS: Array<Number> = [];
  const BONESMITH_HEIRMIR_SPECS: Array<Number> = [];

  if (PELAGOS_SPECS.includes(specID)) {
    return SOULBINDS.PELAGOS;
  } else if (KLEIA_SPECS.includes(specID)) {
    return SOULBINDS.KLEIA;
  } else if (FORGELITE_PRIME_MIKANIKOS_SPECS.includes(specID)) {
    return SOULBINDS.FORGELITE_PRIME_MIKANIKOS;
  } else if (GENERAL_DRAVEN_SPECS.includes(specID)) {
    return SOULBINDS.GENERAL_DRAVEN;
  } else if (NADJIA_THE_MISTBLADE_SPECS.includes(specID)) {
    return SOULBINDS.NADJIA_THE_MISTBLADE;
  } else if (THEOTAR_THE_MAD_DUKE_SPECS.includes(specID)) {
    return SOULBINDS.THEOTAR_THE_MAD_DUKE;
  } else if (NIYA_SPECS.includes(specID)) {
    return SOULBINDS.NIYA;
  } else if (DREAMWEAVER_SPECS.includes(specID)) {
    return SOULBINDS.DREAMWEAVER;
  } else if (KORAYN_SPEC.includes(specID)) {
    return SOULBINDS.KORAYN;
  } else if (PLAGUE_DEVISER_MARILETH_SPECS.includes(specID)) {
    return SOULBINDS.PLAGUE_DEVISER_MARILETH;
  } else if (EMENI_SPECS.includes(specID)) {
    return SOULBINDS.EMENI;
  } else if (BONESMITH_HEIRMIR_SPECS.includes(specID)) {
    return SOULBINDS.BONESMITH_HEIRMIR;
  } else {
    debugSoulbind && console.warn('SpecID: ' + specID + ' passed - can\'t generate fake soulbind for the spec - add it to a list in CombatantInfoFaker.ts');
    return null;
  }
}

//endregion

//region Conduit Generation

function fakeConduitGenerator() {
  const arrayOfConduits: Array<Conduit> = [];
  // Examples
  /*
   arrayOfConduits.push({
    spellID: 340033,
    name: 'Powerful Precision',
    icon: 'ability_hunter_markedshot',
    soulbindConduitID: 199,
    rank: 1,
  });
  arrayOfConduits.push({
    spellID: 339924,
    name: 'Brutal Projectiles',
    icon: 'inv_rapidfire',
    soulbindConduitID: 189,
    rank: 1,
  });*/
  return arrayOfConduits;
}

//endregion

//region Legendary Generation

function fakeLegendaryGeneration(playerGear: any) {
  const legendaryBonusID: number = 0; //Example: 7003 would be the legendary bonusID for call of the wild
  const itemSlotID: number = 0; //Example: 0 would be the head item slot
  if (!playerGear[itemSlotID].bonusIDs) {
    playerGear[itemSlotID].bonusIDs = legendaryBonusID;
  } else if (typeof playerGear[itemSlotID].bonusIDs === 'number') {
    playerGear[itemSlotID].bonusIDs = [playerGear[itemSlotID].bonusIDs];
  } else {
    playerGear[itemSlotID].bonusIDs.push(legendaryBonusID);
  }

  return playerGear;
}

//endregion

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

//region Gear Generation
const CLOTH_SPECS = [SPECS.ARCANE_MAGE.id, SPECS.FIRE_MAGE.id, SPECS.FROST_MAGE.id, SPECS.DISCIPLINE_PRIEST.id, SPECS.HOLY_PRIEST.id, SPECS.SHADOW_PRIEST.id, SPECS.AFFLICTION_WARLOCK.id, SPECS.DEMONOLOGY_WARLOCK.id, SPECS.DESTRUCTION_WARLOCK.id];
const LEATHER_SPECS = [SPECS.BALANCE_DRUID.id, SPECS.FERAL_DRUID.id, SPECS.GUARDIAN_DRUID.id, SPECS.RESTORATION_DRUID.id, SPECS.ASSASSINATION_ROGUE.id, SPECS.OUTLAW_ROGUE.id, SPECS.SUBTLETY_ROGUE.id, SPECS.BREWMASTER_MONK.id, SPECS.WINDWALKER_MONK.id, SPECS.MISTWEAVER_MONK.id, SPECS.HAVOC_DEMON_HUNTER.id, SPECS.VENGEANCE_DEMON_HUNTER.id];
const MAIL_SPECS = [SPECS.BEAST_MASTERY_HUNTER.id, SPECS.MARKSMANSHIP_HUNTER.id, SPECS.SURVIVAL_HUNTER.id, SPECS.ELEMENTAL_SHAMAN.id, SPECS.ENHANCEMENT_SHAMAN.id, SPECS.RESTORATION_SHAMAN.id];
const PLATE_SPECS = [SPECS.HOLY_PALADIN.id, SPECS.PROTECTION_PALADIN.id, SPECS.RETRIBUTION_PALADIN.id, SPECS.ARMS_WARRIOR.id, SPECS.FURY_WARRIOR.id, SPECS.PROTECTION_WARRIOR.id, SPECS.BLOOD_DEATH_KNIGHT.id, SPECS.FROST_DEATH_KNIGHT.id, SPECS.UNHOLY_DEATH_KNIGHT.id];

const genericClothSet = specificGearSets[62]; //Setting Arcane Mage as a generic cloth fallback
const genericLeatherSet = specificGearSets[270]; //Setting Mistweaver Monk as a generic leather fallback
const genericMailSet = specificGearSets[254]; //Setting Marksmanship Hunter as a generic mail fallback
const genericPlateSet = specificGearSets[71]; //Setting Arms Warrior as a generic plate fallback

function fakeGearGenerator(specID: number) {
  if (specificGearSets[specID]) {
    return specificGearSets[specID];
  }
  debugGear && console.warn('No specific gear set has been made for specID ' + specID + ', using a generic one');
  //If a specific set hasn't been made for the passed spec
  if (CLOTH_SPECS.includes(specID)) {
    return genericClothSet;
  } else if (LEATHER_SPECS.includes(specID)) {
    return genericLeatherSet;
  } else if (MAIL_SPECS.includes(specID)) {
    return genericMailSet;
  } else if (PLATE_SPECS.includes(specID)) {
    return genericPlateSet;
  } else {
    console.warn('Unknown spec id passed to fakeGearGenerator.');
    return null;
  }
}

//endregion
