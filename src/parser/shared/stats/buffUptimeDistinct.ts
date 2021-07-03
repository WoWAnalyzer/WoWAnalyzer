import { AnyEvent } from 'parser/core/Events';
import stat, { Info } from 'parser/core/stat';

import buffApplications from './buffApplications';

/**
 * Returns the distinct uptime of the buff. Overlap is ignored (so the total
 * will never be longer than fight duration).
 */
const buffUptimeDistinct = (events: AnyEvent[], info: Info, spellId: number) => {
  const { playerId, fightStart, fightEnd } = info;
  const applications = buffApplications(events);
  const buffHistory = applications[spellId]?.[playerId];

  if (!buffHistory) {
    return 0;
  }

  let lastEnd: number | undefined = undefined;

  return buffHistory.reduce((uptime, buff) => {
    const start = buff.start ?? fightStart;
    const distinctStart = lastEnd !== undefined && lastEnd > start ? lastEnd : start;
    const end = buff.end ?? fightEnd;
    lastEnd = end;

    const duration = Math.max(0, end - distinctStart);

    return uptime + duration;
  }, 0);
};

export default stat(buffUptimeDistinct);
