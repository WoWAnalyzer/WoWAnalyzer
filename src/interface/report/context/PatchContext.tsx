import { Patch } from 'interface/report/PATCHES';
import { createContext, ReactNode, useMemo } from 'react';

interface PatchContext {
  patch: Patch | undefined;
}
export const PatchCtx = createContext<PatchContext | undefined>(undefined);

interface Props {
  children: ReactNode;
  patch: Patch | undefined;
}
export const PatchProvider = ({ children, patch }: Props) => {
  const providerValue = useMemo(() => ({ patch }), [patch]);

  return <PatchCtx value={providerValue}>{children}</PatchCtx>;
};
