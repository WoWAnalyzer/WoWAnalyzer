import { createContext, ReactNode, use, useMemo } from 'react';
import { PlayerInfo } from 'parser/core/Player';
import { CombatantInfoEvent } from 'parser/core/Events';

interface PlayerContext {
  player: PlayerInfo;
  combatant: CombatantInfoEvent;
  combatants: CombatantInfoEvent[];
}

const PlayerCtx = createContext<PlayerContext | undefined>(undefined);

export const usePlayer = () => {
  const ctx = use(PlayerCtx);
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
  const providerValue = useMemo(
    () => ({ player, combatant, combatants }),
    [player, combatant, combatants],
  );

  return <PlayerCtx value={providerValue}>{children}</PlayerCtx>;
};
