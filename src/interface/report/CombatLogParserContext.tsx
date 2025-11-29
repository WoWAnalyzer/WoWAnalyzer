import CombatLogParser from 'parser/core/CombatLogParser';
import { createContext, ReactNode, use, useMemo } from 'react';

interface CombatLogParserContext {
  combatLogParser: CombatLogParser;
}

// This starts off undefined as we don't have an instance of CombatLogParser to work with
// until it gets provided by the Provider.
const CombatLogParserCtx = createContext<CombatLogParserContext | undefined>(undefined);

interface Props {
  children: ReactNode;
  combatLogParser: CombatLogParser;
}
export const CombatLogParserProvider = ({ children, combatLogParser }: Props) => {
  const providerValue = useMemo(() => ({ combatLogParser }), [combatLogParser]);

  return <CombatLogParserCtx value={providerValue}>{children}</CombatLogParserCtx>;
};

export const useCombatLogParser = () => {
  const context = use(CombatLogParserCtx);
  if (context === undefined) {
    throw new Error('Unable to retrieve CombatLogParser for the current report/player combination');
  }
  return context;
};
