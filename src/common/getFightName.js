import { formatDuration } from 'common/format';
import DIFFICULTIES from 'common/DIFFICULTIES';
import getWipeCount from 'common/getWipeCount';

export default function getFightName(report, fight) {
  const wipeCount = getWipeCount(report, fight);
  return `${DIFFICULTIES[fight.difficulty]} ${fight.name} - ${fight.kill ? 'Kill' : `Wipe ${wipeCount}`} (${formatDuration((fight.end_time - fight.start_time) / 1000)})`;
}
