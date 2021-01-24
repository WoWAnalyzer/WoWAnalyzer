import { plural } from '@lingui/macro';

const ROLES = {
  TANK: 0,
  HEALER: 1,
  DPS: {
    MELEE: 2,
    RANGED: 3,
  },
};
export default ROLES;

const naming = {
  [ROLES.TANK]: (num: number) => plural(num, {
    one: 'Tank',
    other: 'Tanks'
  }),
  [ROLES.HEALER]: (num: number) => plural(num, {
    one: 'Healer',
    other: 'Healers'
  }),
  [ROLES.DPS.MELEE]: (num: number) => plural(num, {
    one: 'Melee DPS',
    other: 'Melee DPS'
  }),
  [ROLES.DPS.RANGED]: (num: number) => plural(num, {
    one: 'Ranged DPS',
    other: 'Ranged DPS'
  }),
};

export function getName(role: number) {
  return naming[role];
}

export function getClassName(role: number) {
  switch (Number(role)) {
    case ROLES.TANK: return 'tank';
    case ROLES.HEALER: return 'healer';
    case ROLES.DPS.MELEE: return 'dps melee';
    case ROLES.DPS.RANGED: return 'dps ranged';
    default: return undefined;
  }
}
