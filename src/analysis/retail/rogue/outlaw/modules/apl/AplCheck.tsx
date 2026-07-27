import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { AnyEvent } from 'parser/core/Events';
import { outlaw_rotation } from './OutlawRotation';

/** Outlaw has one priority list, so `info` is unused; the parameter matches the shared signature. */
export const apl = (_info: PlayerInfo): Apl => {
  return outlaw_rotation;
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
