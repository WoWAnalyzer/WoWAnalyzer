import ROLES from 'game/ROLES';
import { useConfig } from 'interface/report/ConfigContext';
import { createContext, useContext } from 'react';

const MELEE = [ROLES.TANK, ROLES.DPS.MELEE];
const CASTER = [ROLES.HEALER, ROLES.DPS.RANGED];

const RoleContext = createContext<number>(ROLES.DPS.RANGED);

export function ByRole({ children }: { children: React.ReactNode }): JSX.Element {
  const role = useConfig().spec.role;
  return <RoleContext.Provider value={role ?? ROLES.DPS.RANGED}>{children}</RoleContext.Provider>;
}

type RoleProps = { children: React.ReactNode | undefined } & (
  | {
      role: number;
    }
  | { roles: number[] }
);

export function Role({ children, ...props }: RoleProps): JSX.Element | null {
  const currentRole = useContext(RoleContext);
  if ('role' in props && props.role !== currentRole) {
    return null;
  }

  if ('roles' in props && props.roles.every((role) => role !== currentRole)) {
    return null;
  }

  return <>{children}</>;
}

Role.Melee = ({ children }: Pick<RoleProps, 'children'>) => <Role roles={MELEE}>{children}</Role>;
Role.Caster = ({ children }: Pick<RoleProps, 'children'>) => <Role roles={CASTER}>{children}</Role>;
