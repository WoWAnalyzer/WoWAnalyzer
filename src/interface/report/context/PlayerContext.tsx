import { createContext, ReactNode, use, useMemo } from 'react';
import { PlayerDetails } from 'parser/core/Player';

interface PlayerContext {
  player: PlayerDetails;
  allPlayers: PlayerDetails[];
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
  player: PlayerDetails;
  allPlayers: PlayerDetails[];
}
export const PlayerProvider = ({ children, player, allPlayers }: Props) => {
  const providerValue = useMemo(() => ({ player, allPlayers }), [player, allPlayers]);

  return <PlayerCtx value={providerValue}>{children}</PlayerCtx>;
};
