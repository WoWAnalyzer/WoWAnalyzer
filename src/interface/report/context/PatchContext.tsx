import { Patch } from 'interface/report/PATCHES';
import { createContext, ReactNode } from 'react';

interface PatchContext {
  patch: Patch | undefined;
}
const PatchCtx = createContext<PatchContext | undefined>(undefined);

interface Props {
  children: ReactNode;
  patch: Patch | undefined;
}
export const PatchProvider = ({ children, patch }: Props) => {
  return <PatchCtx.Provider value={{ patch }}>{children}</PatchCtx.Provider>;
};
