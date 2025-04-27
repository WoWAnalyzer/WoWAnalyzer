import React, { createContext, useContext, useMemo } from 'react';
import Expansion from 'game/Expansion';
import { wclGameVersionToBranch, wclGameVersionToExpansion } from 'game/VERSIONS';
import { useReport } from 'interface/report/context/ReportContext';
import GameBranch from 'game/GameBranch';

interface ExpansionContext {
  expansion: Expansion;
  gameVersion: number;
  branch: GameBranch;
}

const ExpansionCtx = createContext<ExpansionContext>({
  expansion: Expansion.TheWarWithin,
  gameVersion: 0,
  branch: GameBranch.Retail,
});

const ExpansionContextProvider = ({
  children,
  gameVersion,
}: {
  children: React.ReactNode;
  gameVersion: number;
}) => {
  const providerValue = useMemo(
    () => ({
      expansion: wclGameVersionToExpansion(gameVersion),
      gameVersion: gameVersion,
      branch: wclGameVersionToBranch(gameVersion),
    }),
    [gameVersion],
  );

  return <ExpansionCtx.Provider value={providerValue}>{children}</ExpansionCtx.Provider>;
};

export const useExpansionContext = () => useContext(ExpansionCtx);

interface Props {
  children: React.ReactNode;
}
export const ReportExpansionContextProvider = ({ children }: Props) => {
  const { report } = useReport();
  return (
    <ExpansionContextProvider gameVersion={report.gameVersion}>{children}</ExpansionContextProvider>
  );
};
