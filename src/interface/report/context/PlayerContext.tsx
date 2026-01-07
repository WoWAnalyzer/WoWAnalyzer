import { createContext, ReactNode, useContext, useMemo } from 'react';
import { PlayerDetails } from 'parser/core/Player';

interface PlayerContext {
  player: PlayerDetails;
}

const PlayerCtx = createContext<PlayerContext | undefined>(undefined);

export const usePlayer = () => {
  const ctx = useContext(PlayerCtx);
  if (ctx === undefined) {
    throw new Error('Unable to get Config for selected report/player combination');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
  player: PlayerDetails;
}
export const PlayerProvider = ({ children, player }: Props) => {
  const providerValue = useMemo(() => ({ player }), [player]);

  return <PlayerCtx.Provider value={providerValue}>{children}</PlayerCtx.Provider>;
};
