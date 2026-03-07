import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import windwalkerApl from './WindwalkerApl';

export const apl = windwalkerApl;

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
