import type Config from 'parser/Config';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import getConfig from 'parser/getConfig';
import { wclGameVersionToBranch } from 'game/VERSIONS';

export const useMaybeConfig = (): Config | undefined => {
  // this mess of try/catch papers over some historical choices to throw for these contexts instead of allowing them to return undefined.
  // that refactor is...big enough that i'm not doing it today
  let report = undefined;
  try {
    const data = useReport(); // oxlint-disable-line eslint-plugin-react-hooks/rules-of-hooks -- Baseline suppression. Try to fix if you edit this code.
    report = data.report;
  } catch {
    /* do nothing */
  }
  let player = undefined;

  try {
    const playerData = usePlayer(); // oxlint-disable-line eslint-plugin-react-hooks/rules-of-hooks -- Baseline suppression. Try to fix if you edit this code.
    player = playerData.player;
  } catch {
    /* do nothing */
  }

  if (!report || !player) {
    return undefined;
  }
  return getConfig(wclGameVersionToBranch(report.gameVersion), player.specID ?? 0, player);
};

export const useConfig = (): Config => {
  const config = useMaybeConfig();
  if (!config) {
    throw new Error('Unable to get Config for selected report/player combination');
  }

  return config;
};
