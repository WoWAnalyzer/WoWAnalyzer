import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/rogue';
import { AnyEvent } from 'parser/core/Events';
import { hidden_opportunity_rotation } from './HiddenOpportunityRotation';
import { keep_it_rolling_rotation } from './KeepItRollingRotation';

export const apl = (info: PlayerInfo): Apl => {
  if (!info) {
    return hidden_opportunity_rotation;
  }

  if (info.combatant.hasTalent(TALENTS.KEEP_IT_ROLLING_TALENT)) {
    return keep_it_rolling_rotation;
  }

  return hidden_opportunity_rotation;
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
