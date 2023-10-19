import styled from '@emotion/styled';
import ROLES from 'game/ROLES';
import { ComponentProps } from 'react';

const Img = styled.img`
  border: 1px solid #111;
  height: 1.2em;
  width: 1.2em;
  border-radius: 50%;
`;

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
