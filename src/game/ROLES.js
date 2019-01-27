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
  [ROLES.TANK]: num => plural({
    value: num,
    one: 'Tank',
    other: 'Tanks',
  }),
  [ROLES.HEALER]: num => plural({
    value: num,
    one: 'Healer',
    other: 'Healers',
  }),
  [ROLES.DPS.MELEE]: num => plural({
    value: num,
    other: 'Melee DPS',
  }),
  [ROLES.DPS.RANGED]: num => plural({
    value: num,
    other: 'Ranged DPS',
  }),
};

export function getName(role) {
  return naming[role];
}
