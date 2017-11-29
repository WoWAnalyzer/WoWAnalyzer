import getBossName from './getBossName';
import getWipeCount from './getWipeCount';
import { formatDuration } from './format';

export default function getFightName(report, fight) {
  const wipeCount = getWipeCount(report.fights, fight);
  return `${getBossName(fight)} - ${fight.kill ? 'Kill' : `Wipe ${wipeCount}`} (${formatDuration((fight.end_time - fight.start_time) / 1000)})`;
}
