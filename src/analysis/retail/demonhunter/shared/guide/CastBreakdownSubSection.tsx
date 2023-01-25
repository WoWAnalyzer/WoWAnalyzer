import { ReactNode } from 'react';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { CastEvent } from 'parser/core/Events';

export interface Cast {
  event: CastEvent;
}

export interface CastPerformance {
  checklistItems: CooldownExpandableItem[];
  overallPerf: QualitativePerformance;
}

interface Props<T extends Cast> {
  castPerformanceConverter: (cast: T, idx: number) => CastPerformance;
  casts: T[];
  explanation: JSX.Element;
  headerConverter: (cast: T, idx: number) => ReactNode;
}
const CastBreakdownSubSection = <T extends Cast>({
  castPerformanceConverter,
  casts,
  explanation,
  headerConverter,
}: Props<T>) => {
  const data = (
    <div>
      <strong>Per-Cast Breakdown</strong>
      <small> - click to expand</small>
      {casts.map((cast, idx) => {
        const header = headerConverter(cast, idx);
        const { checklistItems, overallPerf } = castPerformanceConverter(cast, idx);
        return (
          <CooldownExpandable
            header={header}
            checklistItems={checklistItems}
            perf={overallPerf}
            key={idx}
          />
        );
      })}
    </div>
  );
  const noCastData = <p>You did not cast this ability during this encounter.</p>;

  return explanationAndDataSubsection(explanation, casts.length > 0 ? data : noCastData);
};

export default CastBreakdownSubSection;
