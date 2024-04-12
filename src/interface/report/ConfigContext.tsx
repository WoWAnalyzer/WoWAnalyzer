import type Config from 'parser/Config';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import getConfig from 'parser/getConfig';
import { wclGameVersionToExpansion } from 'game/VERSIONS';

export const useMaybeConfig = (): Config | undefined => {
  const { report } = useReport();
  const { player, combatant } = usePlayer();
  return getConfig(
    wclGameVersionToExpansion(report.gameVersion),
    combatant.specID,
    player,
    combatant,
  );
};

export const useConfig = (): Config => {
  const config = useMaybeConfig();
  if (!config) {
    throw new Error('Unable to get Config for selected report/player combination');
  }

  return config;
};
