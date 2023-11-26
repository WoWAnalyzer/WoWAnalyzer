import { createChecklistItem } from 'parser/core/MajorCooldowns/MajorCooldown';
import { isDefined } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PRIMARY_BUFF_KEY, SECONDARY_BUFF_KEY } from './Sepsis';
import buffUsagePerformance from './BuffUsagePerformance';
import CombatLogParser from 'parser/core/CombatLogParser';
import ShivPerformance from './ShivPerformance';
import SepsisCast from './interfaces/SepsisCast';

type Params = {
  sepsisCast: SepsisCast;
  usingLightweightShiv: boolean;
  owner: CombatLogParser;
};

const ExplainPerformance = ({ sepsisCast, usingLightweightShiv, owner }: Params) => {
  const buffOneChecklistItem = createChecklistItem(
    'initial-sepsis-buff',
    sepsisCast,
    buffUsagePerformance({ cast: sepsisCast, buffId: PRIMARY_BUFF_KEY, owner }),
  );
  const buffTwoChecklistItem = createChecklistItem(
    'secondary-sepsis-buff',
    sepsisCast,
    buffUsagePerformance({ cast: sepsisCast, buffId: SECONDARY_BUFF_KEY, owner }),
  );

  const shivChecklistItem = usingLightweightShiv
    ? createChecklistItem('shiv', sepsisCast, ShivPerformance({ cast: sepsisCast, owner }))
    : undefined;

  const checklistItems = [buffOneChecklistItem, buffTwoChecklistItem, shivChecklistItem].filter(
    isDefined,
  );

  const overallPerformance = combineQualitativePerformances(
    checklistItems.map((item) => item.performance),
  );
  return {
    event: sepsisCast.event,
    checklistItems: checklistItems,
    performance: overallPerformance,
    performanceExplanation:
      overallPerformance !== QualitativePerformance.Fail
        ? `${overallPerformance} Usage`
        : `Bad Usage`,
  };
};

export default ExplainPerformance;
