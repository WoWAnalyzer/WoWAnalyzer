import SPECS from 'game/SPECS';
import { specificGearSets } from 'interface/report/CombatantInfoFakerGearsets';

export function generateFakeCombatantInfo(player: any) {
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
