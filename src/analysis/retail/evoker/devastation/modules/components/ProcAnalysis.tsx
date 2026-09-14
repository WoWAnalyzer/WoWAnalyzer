import { JSX } from 'react';
import {
  CastEvaluation,
  CastOverview,
  CastSummary,
  GuideSection,
  StatisticData,
  TipBox,
} from 'interface/guide/components';
import Spell from 'common/SPELLS/Spell';
import { AdditionalContent } from 'interface/guide/components/CastDetail';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export interface AnalysisData {
  spell: Spell;
  casts: CastEvaluation[];
  stats?: StatisticData[];
  additionalContent?: AdditionalContent;
}

export function PerformanceResolver(percentage: number, thresholds = [1, 0.95, 0.8]) {
  return percentage >= thresholds[0]
    ? QualitativePerformance.Perfect
    : percentage >= thresholds[1]
      ? QualitativePerformance.Good
      : percentage >= thresholds[2]
        ? QualitativePerformance.Ok
        : QualitativePerformance.Fail;
}

export function ProcAnalysisWrapper({
  analysisData,
  explanation,
  usageInstructions,
}: {
  analysisData: AnalysisData;
  explanation: JSX.Element;
  usageInstructions: JSX.Element;
}) {
  if (analysisData === undefined || analysisData.casts.length === 0) return null;

  const explanationElement = (
    <>
      <div>{explanation}</div>
      <TipBox type="info" title="Usage Information">
        <div style={{ margin: '6px 0px 0px 0px' }}>{usageInstructions}</div>
      </TipBox>
    </>
  );

  const overview =
    analysisData.stats !== undefined || analysisData.additionalContent !== undefined ? (
      <>
        <CastOverview
          spell={analysisData.spell}
          title="Overview"
          stats={analysisData.stats || []}
          additionalContent={analysisData.additionalContent || undefined}
        />
      </>
    ) : null;

  return (
    <GuideSection
      spell={analysisData.spell}
      explanation={explanationElement}
      explanationPercent={40}
    >
      {overview}
      <CastSummary
        spell={analysisData.spell}
        title={`Casts`}
        casts={analysisData.casts}
        showBreakdown
      />
    </GuideSection>
  );
}
