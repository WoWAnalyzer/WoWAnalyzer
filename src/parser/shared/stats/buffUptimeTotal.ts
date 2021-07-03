import { AnyEvent } from 'parser/core/Events';
import stat, { Info } from 'parser/core/stat';

import buffApplications from './buffApplications';

const buffUptimeTotal = (events: AnyEvent[], info: Info, spellId: number) => {
  const { playerId, fightStart, fightEnd } = info;
  const applications = buffApplications(events);
  const buffHistory = applications[spellId]?.[playerId];

  if (!buffHistory) {
    return 0;
  }

  return buffHistory.reduce(
    (uptime, buff) => uptime + (buff.end ?? fightEnd) - (buff.start ?? fightStart),
    0,
  );
};

export default stat(buffUptimeTotal);
