export default {
  MANA: 0,
  RAGE: 1,
  FOCUS: 2,
  ENERGY: 3,
  COMBO_POINTS: 4,
  RUNES: 5,
  RUNIC_POWER: 6,
  SOUL_SHARDS: 7,
  ASTRAL_POWER: 8,
  HOLY_POWER: 9,
  ALTERNATE_POWER: 10, // Used for encounter-specific resources like Torment on Demonic Inqusition
  MAELSTROM: 11,
  CHI: 12,
  INSANITY: 13,
  // 14 is obsolete
  // 15 is obsolete
  ARCANE_CHARGES: 16,
  FURY: 17,
  PAIN: 18,
};

export function getResource(classResources, type) {
  return classResources.find(resource => resource.type === type);
}
