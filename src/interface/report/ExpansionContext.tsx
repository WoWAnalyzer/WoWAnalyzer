import React, { createContext, useContext } from 'react';
import Expansion from 'game/Expansion';
import { wclGameVersionToExpansion } from 'game/VERSIONS';

export interface ExpansionContext {
  expansion: Expansion,
  gameVersion: number
}

export const ExpansionCtx = createContext<ExpansionContext>({
  expansion: Expansion.Dragonflight,
  gameVersion: 0,
});

export const ExpansionContextProvider = ({ children, gameVersion }: { children: React.ReactNode, gameVersion: number }) => {
  return (<ExpansionCtx.Provider
    value={{
      expansion: wclGameVersionToExpansion(gameVersion),
      gameVersion: 0,
    }}
  >
    {children}
  </ExpansionCtx.Provider>);
};

export const useExpansionContext = () => useContext(ExpansionCtx);
