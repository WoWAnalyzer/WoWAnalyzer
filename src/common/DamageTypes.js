export const damageType = {
  1: 'Physical',
  2: 'Holy',
  4: 'Fire',
  8: 'Nature',
  16: 'Frost',
  28: 'Elemental',
  32: 'Shadow',
  33: 'Shadowstrike',
  34: 'Twilight',
  36: 'Shadowflame',
  40: 'Plague',
  48: 'Shadowfrost',
  64: 'Arcane',
  96: 'Spellshadow',
  100: 'Special',
  124: 'Chaos',
};

export function getMagicDescription(type) {
  if (damageType[type] === undefined) {
    return 'Chaos';
  }
  return damageType[type];
}
