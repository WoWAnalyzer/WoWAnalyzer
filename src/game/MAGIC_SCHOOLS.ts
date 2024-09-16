const MAGIC_SCHOOLS: {
  names: { [id: number]: string };
  ids: { [name: string]: number };
} = {
  names: {
    1: 'Physical',
    2: 'Holy',
    4: 'Fire',
    6: 'Radiant',
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
    72: 'Astral',
    96: 'Spellshadow',
    100: 'Special',
    124: 'Chaos',
  },
  // Multi-school spells are OR'ed together using these base schools
  ids: {
    PHYSICAL: 1,
    HOLY: 2,
    FIRE: 4,
    RADIANT: 6,
    NATURE: 8,
    FROST: 16,
    SHADOW: 32,
    ARCANE: 64,
    ASTRAL: 72,
  },
};

const colors: Record<keyof typeof MAGIC_SCHOOLS.ids, [number, number, number]> = {
  [MAGIC_SCHOOLS.ids.PHYSICAL]: [204, 178, 120],
  [MAGIC_SCHOOLS.ids.HOLY]: [255, 230, 128],
  [MAGIC_SCHOOLS.ids.FIRE]: [216, 65, 65],
  [MAGIC_SCHOOLS.ids.NATURE]: [77, 255, 77],
  [MAGIC_SCHOOLS.ids.FROST]: [128, 255, 255],
  [MAGIC_SCHOOLS.ids.SHADOW]: [128, 128, 255],
  [MAGIC_SCHOOLS.ids.ARCANE]: [255, 128, 255],
};

/**
 * Get the color for an ability's school of magic.
 *
 * For multi-school spells, picks the highest-numbered school (so for Frostfire, it picks Frost (16 > 4)).
 *
 * Ideally we'd do some smart merging but simple averaging didn't look good.
 */
export function color(school: number): string {
  // if a value for this color already exists, return it immediately
  if (colors[school]) {
    return `rgb(${colors[school].join(', ')})`;
  }
  // otherwise look for the highest numbered school
  let color = [0, 0, 0];
  let current = 1;
  while (current <= school) {
    if (current & school) {
      color = colors[current];
    }
    current = current << 1;
  }

  return `rgb(${color.join(', ')})`;
}

export function isMatchingDamageType(damageType: number, matchingType: number): boolean {
  return (damageType & matchingType) === matchingType;
}

export default MAGIC_SCHOOLS;
