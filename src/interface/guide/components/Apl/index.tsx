import { useMemo, useState, type JSX } from 'react';
import cssComponent from 'interface/utils/css-component';
import styles from './index.module.scss';
import { useEvents, useInfo } from 'interface/guide';
import aplCheck, { Apl, CheckResult } from 'parser/shared/metrics/apl';

import AplRules from './rules';
import ViolationProblemList, {
  AplViolationExplanations,
  ExplanationSelectionContext,
  SelectedExplanation,
} from './violations';
import { AplViolationExplainers, defaultExplainers } from './violations/claims';
import { formatPercentage } from 'common/format';
import PassFailBar from 'interface/guide/components/PassFailBar';

const AplSubsectionHeader = cssComponent('header', styles.AplSubsectionHeader, [] as const);

const AplSummaryTable = cssComponent('table', styles.AplSummaryTable, [] as const);

const ValueData = cssComponent('td', styles.ValueData, [] as const);

export function AplSummary({ apl, results }: { apl: Apl; results: CheckResult }) {
  return (
    <>
      <AplSubsectionHeader>Priority List</AplSubsectionHeader>
      <AplRules apl={apl} results={results} />
    </>
  );
}

/**
 * Produce a summary of the APL itself. This is just an un-annotated reference.
 */
function AplSummaryColumn({
  apl,
  results,
  topSection: TopSection,
}: {
  topSection: React.ComponentType<{ apl: Apl; results: CheckResult }>;
  apl: Apl;
  results: CheckResult;
}): JSX.Element | null {
  return (
    <div>
      <TopSection apl={apl} results={results} />
      <AplSubsectionHeader>Details</AplSubsectionHeader>
      <AplSummaryTable>
        <tbody>
          <tr>
            <td>Accuracy</td>
            <ValueData>
              {formatPercentage(
                results.successes.length / (results.successes.length + results.violations.length),
                1,
              )}
              %
            </ValueData>
            <td>
              <PassFailBar
                pass={results.successes.length}
                total={results.successes.length + results.violations.length}
                passTooltip={`Correct Uses: ${results.successes.length}`}
                failTooltip={`Incorrect Uses: ${results.violations.length}`}
              />
            </td>
          </tr>
          <tr>
            <td>Total Abilities Used</td>
            <ValueData>{results.successes.length + results.violations.length}</ValueData>
            <td />
          </tr>
        </tbody>
      </AplSummaryTable>
    </div>
  );
}

const AplViolationContainer = cssComponent('div', styles.AplViolationContainer, [] as const);

const AplLayout = cssComponent('div', styles.AplLayout, [] as const);

interface AplSectionProps {
  checker: ReturnType<typeof aplCheck>;
  apl: Apl;
  summary?: typeof AplSummary;
  violationExplainers?: AplViolationExplainers;
}

export function AplSectionData({
  checker,
  apl,
  summary: Summary = AplSummary,
  violationExplainers,
}: AplSectionProps): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const [selectedExplanation, setSelectedExplanation] = useState<
    SelectedExplanation<any> | undefined // oxlint-disable-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
  >(undefined);

  const result: CheckResult | undefined = useMemo(
    () => (info ? checker(events, info) : undefined),
    [events, info, checker],
  );

  if (!info || !result) {
    return null;
  }

  return (
    <ExplanationSelectionContext value={setSelectedExplanation}>
      <AplLayout>
        <AplSummaryColumn apl={apl} results={result} topSection={Summary} />
        <AplViolationContainer>
          <AplSubsectionHeader>Most Common Problems</AplSubsectionHeader>
          <AplViolationExplanations
            apl={apl}
            result={result}
            explainers={violationExplainers ?? defaultExplainers}
          />
        </AplViolationContainer>
        {selectedExplanation && (
          <ViolationProblemList {...selectedExplanation} result={result} apl={apl} />
        )}
      </AplLayout>
    </ExplanationSelectionContext>
  );
}
