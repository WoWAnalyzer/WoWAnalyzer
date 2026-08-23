import ROLES from './ROLES';

export type SpecRole = 'tank' | 'healer' | 'dps';

interface SpecMetadata {
  className: string;
  role: SpecRole;
}

const classSpecs: Record<string, number[]> = {
  DeathKnight: [250, 251, 252],
  DemonHunter: [577, 581],
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

const metadata = new Map<number, SpecMetadata>();
for (const [className, specs] of Object.entries(classSpecs)) {
  for (const specID of specs) {
    metadata.set(specID, {
      className,
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
