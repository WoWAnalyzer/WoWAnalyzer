import { clsx } from 'clsx';
import ROLES from 'game/ROLES';
import { ComponentProps } from 'react';
import styles from './RoleIcon.module.scss';

interface RoleIconProps extends ComponentProps<'img'> {
  roleId: number | null;
}

const RoleIcon = ({ roleId, className, ...props }: RoleIconProps) => {
  let iconName: string | undefined;
  switch (roleId) {
    case ROLES.TANK:
      iconName = 'tank';
      break;
    case ROLES.HEALER:
      iconName = 'healer';
      break;
    case ROLES.DPS.MELEE:
      iconName = 'dps';
      break;
    case ROLES.DPS.RANGED:
      iconName = 'dps.ranged';
      break;
    default:
      iconName = undefined;
      break;
  }

  return iconName == null ? null : (
    <img className={clsx(styles.img, className)} src={`/roles/${iconName}.jpg`} alt="" {...props} />
  );
};

export default RoleIcon;
