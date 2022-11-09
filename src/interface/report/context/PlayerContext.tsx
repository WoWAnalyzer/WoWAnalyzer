import { createContext, ReactNode, useContext } from 'react';
import { PlayerInfo } from 'parser/core/Player';
import { CombatantInfoEvent } from 'parser/core/Events';

interface PlayerContext {
  player: PlayerInfo;
  combatant: CombatantInfoEvent;
  combatants: CombatantInfoEvent[];
}

const PlayerCtx = createContext<PlayerContext | undefined>(undefined);

export default PlayerCtx;

export const usePlayer = () => {
  const ctx = useContext(PlayerCtx);
  if (ctx === undefined) {
    throw new Error('Unable to get Config for selected report/player combination');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
  player: PlayerInfo;
  combatant: CombatantInfoEvent;
  combatants: CombatantInfoEvent[];
}
export const PlayerProvider = ({ children, player, combatant, combatants }: Props) => {
  return (
    <PlayerCtx.Provider value={{ player, combatant, combatants }}>{children}</PlayerCtx.Provider>
  );
};
