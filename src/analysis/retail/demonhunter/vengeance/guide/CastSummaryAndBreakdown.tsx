import { useState } from 'react';
import { ControlledExpandable } from 'interface';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import GradiatedPerformanceBar, {
  GradiatedPerformanceBarInfo,
} from 'interface/guide/components/GradiatedPerformanceBar';

interface Props {
  castEntries: BoxRowEntry[];
  perfect?: number | GradiatedPerformanceBarInfo;
  good?: number | GradiatedPerformanceBarInfo;
  ok?: number | GradiatedPerformanceBarInfo;
  bad?: number | GradiatedPerformanceBarInfo;
}

const CastSummaryAndBreakdown = ({ castEntries, perfect, good, ok, bad }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ControlledExpandable
      header={<GradiatedPerformanceBar perfect={perfect} good={good} ok={ok} bad={bad} />}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      <small>Mouseover for more details.</small>
      <PerformanceBoxRow values={castEntries} />
    </ControlledExpandable>
  );
};

export default CastSummaryAndBreakdown;
