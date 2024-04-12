import type Config from 'parser/Config';
import { usePlayer } from 'interface/report/context/PlayerContext';
import { useReport } from 'interface/report/context/ReportContext';
import getConfig from 'parser/getConfig';
import { wclGameVersionToExpansion } from 'game/VERSIONS';

export const useMaybeConfig = (): Config | undefined => {
  // this mess of try/catch papers over some historical choices to throw for these contexts instead of allowing them to return undefined.
  // that refactor is...big enough that i'm not doing it today
  let report = undefined;
  try {
    const data = useReport();
    report = data.report;
  } catch {
    /* do nothing */
  }
  let player = undefined;
    let combatant = undefined;

  try {
    const playerData = usePlayer();
    player = playerData.player;
    combatant = playerData.combatant;
  } catch {
    /* do nothing */
  }

  if (!report || !player || !combatant) {
    return undefined;
  }
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
