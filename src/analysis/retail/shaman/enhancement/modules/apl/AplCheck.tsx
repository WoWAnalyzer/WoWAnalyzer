import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { getBuild } from './AplSelector';
/**
 * Based on https://www.icy-veins.com/wow/enhancement-shaman-pve-dps-guide
 */

export const apl = (info: PlayerInfo): Apl => {
  return getBuild(info.combatant) ?? build([]);
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
