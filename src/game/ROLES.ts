const ROLES = {
  TANK: 0,
  HEALER: 1,
  DPS: {
    MELEE: 2,
    RANGED: 3,
  },
};
export default ROLES;

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
