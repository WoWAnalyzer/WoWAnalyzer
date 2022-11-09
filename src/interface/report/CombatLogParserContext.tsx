import CombatLogParser from 'parser/core/CombatLogParser';
import { createContext, ReactNode, useContext } from 'react';

export interface CombatLogParserContext {
  combatLogParser: CombatLogParser;
}

// This starts off undefined as we don't have an instance of CombatLogParser to work with
// until it gets provided by the Provider.
export const CombatLogParserCtx = createContext<CombatLogParserContext | undefined>(undefined);

interface Props {
  children: ReactNode;
  combatLogParser: CombatLogParser;
}
export const CombatLogParserProvider = ({ children, combatLogParser }: Props) => (
  <CombatLogParserCtx.Provider value={{ combatLogParser }}>{children}</CombatLogParserCtx.Provider>
);

export const useCombatLogParser = () => {
  const context = useContext(CombatLogParserCtx);
  if (context === undefined) {
    throw new Error('Unable to retrieve CombatLogParser for the current report/player combination');
  }
  return context;
};
