import ROLES from './ROLES';

export type SpecRole = 'tank' | 'healer' | 'dps';

export interface SpecMetadata {
  className: string;
  specName: string;
  role: SpecRole;
}

const classSpecs: Record<string, number[]> = {
  DeathKnight: [250, 251, 252],
  DemonHunter: [577, 581, 1480],
  Druid: [102, 103, 104, 105],
  Evoker: [1467, 1468, 1473],
  Hunter: [253, 254, 255],
  Mage: [62, 63, 64],
  Monk: [268, 269, 270],
  Paladin: [65, 66, 70],
  Priest: [256, 257, 258],
  Rogue: [259, 260, 261],
  Shaman: [262, 263, 264],
  Warlock: [265, 266, 267],
  Warrior: [71, 72, 73],
};

const tankSpecs = new Set([250, 581, 104, 268, 66, 73]);
const healerSpecs = new Set([105, 256, 257, 264, 270, 65, 1468]);
const specNames: Readonly<Record<number, string>> = {
  62: 'Arcane',
  63: 'Fire',
  64: 'Frost',
  65: 'Holy',
  66: 'Protection',
  70: 'Retribution',
  71: 'Arms',
  72: 'Fury',
  73: 'Protection',
  102: 'Balance',
  103: 'Feral',
  104: 'Guardian',
  105: 'Restoration',
  250: 'Blood',
  251: 'Frost',
  252: 'Unholy',
  253: 'BeastMastery',
  254: 'Marksmanship',
  255: 'Survival',
  256: 'Discipline',
  257: 'Holy',
  258: 'Shadow',
  259: 'Assassination',
  260: 'Outlaw',
  261: 'Subtlety',
  262: 'Elemental',
  263: 'Enhancement',
  264: 'Restoration',
  265: 'Affliction',
  266: 'Demonology',
  267: 'Destruction',
  268: 'Brewmaster',
  269: 'Windwalker',
  270: 'Mistweaver',
  577: 'Havoc',
  581: 'Vengeance',
  1467: 'Devastation',
  1468: 'Preservation',
  1473: 'Augmentation',
  1480: 'Devourer',
};

const metadata = new Map<number, SpecMetadata>();
for (const [className, specs] of Object.entries(classSpecs)) {
  for (const specID of specs) {
    const specName = specNames[specID];
    if (!specName) continue;
    metadata.set(specID, {
      className,
      specName,
      role: tankSpecs.has(specID) ? 'tank' : healerSpecs.has(specID) ? 'healer' : 'dps',
    });
  }
}

/** Pure metadata suitable for parser workers; unknown specs remain explicit. */
export const getSpecMetadata = (specID: number): SpecMetadata | undefined => metadata.get(specID);

export const specRoleFromGameRole = (role: number): SpecRole | undefined =>
  role === ROLES.TANK
    ? 'tank'
    : role === ROLES.HEALER
      ? 'healer'
      : role === ROLES.DPS.MELEE || role === ROLES.DPS.RANGED
        ? 'dps'
        : undefined;
