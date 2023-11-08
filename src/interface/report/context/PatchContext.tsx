import { Patch } from 'interface/report/PATCHES';
import { createContext, ReactNode, useContext } from 'react';

interface PatchContext {
  patch: Patch | undefined;
}
const PatchCtx = createContext<PatchContext | undefined>(undefined);

export default PatchCtx;

export const usePatch = () => {
  const ctx = useContext(PatchCtx);
  if (ctx === undefined) {
    throw new Error('Unable to get patch');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
  patch: Patch | undefined;
}
export const PatchProvider = ({ children, patch }: Props) => {
  return <PatchCtx.Provider value={{ patch }}>{children}</PatchCtx.Provider>;
};
