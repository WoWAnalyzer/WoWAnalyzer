import cssComponent from 'interface/utils/css-component';
import styles from './RoleIcon.module.scss';
import ROLES from 'game/ROLES';
import { ComponentProps } from 'react';

const Img = cssComponent('img', styles.Img, [] as const);

interface RoleIconProps extends ComponentProps<typeof Img> {
  roleId: number | null;
}

const RoleIcon = ({ roleId, ...props }: RoleIconProps) => {
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

  return iconName == null ? null : <Img src={`/roles/${iconName}.jpg`} alt="" {...props} />;
};

export default RoleIcon;
