import SPECS from 'game/SPECS';
import { specificGearSets } from 'interface/report/CombatantInfoFakerGearsets';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SOULBINDS from 'game/shadowlands/SOULBINDS';
import { CombatantInfo } from 'parser/core/Combatant';

const debugGear = false;

type FakeInfo = {
  covenantID: CombatantInfo['covenantID'],
  soulbindID: CombatantInfo['soulbindID'],
  conduits: CombatantInfo['conduits'],
  soulbindTraits: CombatantInfo['soulbindTraits']
  legendaryInfo: { slotId: number, bonusId: number } //slotId 0 would be head slot, and bonusID is the bonusID that is added to an item with the given legendary effect
}

const SPEC_CONFIGS: { [specId: number]: FakeInfo } = {
  [SPECS.MARKSMANSHIP_HUNTER.id]: {
    covenantID: COVENANTS.VENTHYR.id,
    soulbindID: SOULBINDS.GENERAL_DRAVEN.id,
    conduits: [{ traitID: 199, rank: 1, spellID: 340033, icon: 'ability_hunter_markedshot' }],
    legendaryInfo: { slotId: 0, bonusId: 7003 },
    soulbindTraits: [],
  },
  [SPECS.BEAST_MASTERY_HUNTER.id]: {
    covenantID: COVENANTS.NIGHT_FAE.id,
    soulbindID: SOULBINDS.NIYA.id,
    conduits: [{ traitID: 185, rank: 1, spellID: 339750, icon: 'spell_winston_rage' }],
    legendaryInfo: { slotId: 0, bonusId: 7003 },
    soulbindTraits: [],
  },
  [SPECS.FROST_MAGE.id]: {
    covenantID: COVENANTS.VENTHYR.id,
    soulbindID: SOULBINDS.NADJIA_THE_MISTBLADE.id,
    conduits: [{ traitID: 21, rank: 1, spellID: 336569, icon: 'spell_frost_frostblast' }],
    legendaryInfo: { slotId: 14, bonusId: 6828 },
    soulbindTraits: [],
  },
};

export function generateFakeCombatantInfo(player: any) {
  const fakedPlayer = player;
  fakedPlayer.gear = fakeGearGenerator(player.specID);
  fakedPlayer.gear = fakeLegendaryGeneration(player.gear, SPEC_CONFIGS[player.specID]?.legendaryInfo);
  fakedPlayer.auras = fakeBuffGenerator();
  fakedPlayer.covenantID = SPEC_CONFIGS[player.specID]?.covenantID;
  fakedPlayer.soulbindID = SPEC_CONFIGS[player.specID]?.soulbindID;
  fakedPlayer.conduits = SPEC_CONFIGS[player.specID]?.conduits;
  fakedPlayer.soulbindTraits = SPEC_CONFIGS[player.specID]?.soulbindTraits;
  fakedPlayer.error = null;
  return fakedPlayer;
}

//region Legendary Generation

function fakeLegendaryGeneration(playerGear: any, legendaryInfo: { slotId: number, bonusId: number }) {
  const legendaryBonusID: number = legendaryInfo ? legendaryInfo.bonusId : 0; //Example: 7003 would be the legendary bonusID for call of the wild
  const itemSlotID: number = legendaryInfo ? legendaryInfo.slotId : 0; //Example: 0 would be the head item slot
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
const CLOTH_SPECS: number[] = [SPECS.ARCANE_MAGE.id, SPECS.FIRE_MAGE.id, SPECS.FROST_MAGE.id, SPECS.DISCIPLINE_PRIEST.id, SPECS.HOLY_PRIEST.id, SPECS.SHADOW_PRIEST.id, SPECS.AFFLICTION_WARLOCK.id, SPECS.DEMONOLOGY_WARLOCK.id, SPECS.DESTRUCTION_WARLOCK.id];
const LEATHER_SPECS: number[] = [SPECS.BALANCE_DRUID.id, SPECS.FERAL_DRUID.id, SPECS.GUARDIAN_DRUID.id, SPECS.RESTORATION_DRUID.id, SPECS.ASSASSINATION_ROGUE.id, SPECS.OUTLAW_ROGUE.id, SPECS.SUBTLETY_ROGUE.id, SPECS.BREWMASTER_MONK.id, SPECS.WINDWALKER_MONK.id, SPECS.MISTWEAVER_MONK.id, SPECS.HAVOC_DEMON_HUNTER.id, SPECS.VENGEANCE_DEMON_HUNTER.id];
const MAIL_SPECS: number[] = [SPECS.BEAST_MASTERY_HUNTER.id, SPECS.MARKSMANSHIP_HUNTER.id, SPECS.SURVIVAL_HUNTER.id, SPECS.ELEMENTAL_SHAMAN.id, SPECS.ENHANCEMENT_SHAMAN.id, SPECS.RESTORATION_SHAMAN.id];
const PLATE_SPECS: number[] = [SPECS.HOLY_PALADIN.id, SPECS.PROTECTION_PALADIN.id, SPECS.RETRIBUTION_PALADIN.id, SPECS.ARMS_WARRIOR.id, SPECS.FURY_WARRIOR.id, SPECS.PROTECTION_WARRIOR.id, SPECS.BLOOD_DEATH_KNIGHT.id, SPECS.FROST_DEATH_KNIGHT.id, SPECS.UNHOLY_DEATH_KNIGHT.id];

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
