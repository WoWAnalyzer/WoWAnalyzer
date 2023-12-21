import { defineMessage, plural } from '@lingui/macro';

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
  [ROLES.TANK]: (num: number) =>
    defineMessage({
      id: 'common.roles.tank',
      message: plural(num, {
        one: 'Tank',
        other: 'Tanks',
      }),
    }),
  [ROLES.HEALER]: (num: number) =>
    defineMessage({
      id: 'common.roles.healer',
      message: plural(num, {
        one: 'Healer',
        other: 'Healers',
      }),
    }),
  [ROLES.DPS.MELEE]: (num: number) =>
    defineMessage({
      id: 'common.roles.dps.melee',
      message: plural(num, {
        one: 'Melee DPS',
        other: 'Melee DPS',
      }),
    }),
  [ROLES.DPS.RANGED]: (num: number) =>
    defineMessage({
      id: 'common.roles.dps.ranged',
      message: plural(num, {
        one: 'Ranged DPS',
        other: 'Ranged DPS',
      }),
    }),
};

export function getName(role: number) {
  return naming[role];
}

export function getClassName(role: number) {
  switch (Number(role)) {
    case ROLES.TANK:
      return 'tank';
    case ROLES.HEALER:
      return 'healer';
    case ROLES.DPS.MELEE:
      return 'dps melee';
    case ROLES.DPS.RANGED:
      return 'dps ranged';
    default:
      return undefined;
  }
}
