import {
  getPerformanceExplanation,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { createContext, ReactNode, use, useMemo } from 'react';
import { AnyEvent } from 'parser/core/Events';
import cssComponent from 'interface/utils/css-component';
import styles from './core.module.scss';
import { formatDuration } from 'common/format';
import { PerformanceMark } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import useSessionFeatureFlag from 'interface/useSessionFeatureFlag';

/**
 * Contains data about one aspect of the quality of a cast and the reasoning.
 */
export interface UsageInfo {
  performance: QualitativePerformance;
  summary: ReactNode;
  details: ReactNode;
}

/**
 * Extension of {@link UsageInfo} that also contains the cast timestamp and what is being checked.
 */
export interface ChecklistUsageInfo extends UsageInfo {
  check: string;
  timestamp: number;
}

/**
 * Contains data about a cast event, including the overall quality and the decisions that make
 * up said quality.
 */
export interface SpellUse {
  event: AnyEvent;
  checklistItems: ChecklistUsageInfo[];
  performance: QualitativePerformance;
  extraDetails?: ReactNode;
  performanceExplanation?: ReactNode;
}

const SpellTooltipBody = 'div';
const SpellRowContainer = cssComponent('div', styles.SpellRowContainer, [] as const);

/**
 * Wrapper for what gets displayed under the performance row.
 */
export const PerformanceUsageRow = cssComponent('div', styles.PerformanceUsageRow, [] as const);

const SpellRow = ({ usageInfo }: { usageInfo: ChecklistUsageInfo }) => (
  <SpellRowContainer>
    <div style={{ justifySelf: 'center' }}>
      <PerformanceMark perf={usageInfo.performance} />
    </div>
    <div>{usageInfo.summary}</div>
  </SpellRowContainer>
);

/**
 * Helper function to convert a {@link SpellUse} to a {@link BoxRowEntry}.
 */
export const spellUseToBoxRowEntry = (
  { event, performance, performanceExplanation, checklistItems }: SpellUse,
  fightStart: number,
): BoxRowEntry => ({
  value: performance,
  tooltip: (
    <>
      <div>
        <strong>Time:</strong> {formatDuration(event.timestamp - fightStart)}
      </div>
      <PerformanceUsageRow>
        <PerformanceMark perf={performance} />{' '}
        {performanceExplanation ?? getPerformanceExplanation(performance)}
      </PerformanceUsageRow>
      {checklistItems.length > 0 ? (
        <SpellTooltipBody>
          <SpellRowContainer>
            <strong>Perf.</strong>
            <strong>Summary</strong>
          </SpellRowContainer>
          {checklistItems.map(
            (usageInfo) =>
              usageInfo.summary && <SpellRow usageInfo={usageInfo} key={usageInfo.check} />,
          )}
        </SpellTooltipBody>
      ) : undefined}
    </>
  ),
});

interface SpellUsageContextValue {
  hideGoodCasts: boolean;
  setHideGoodCasts: (p: boolean) => void;
}

const SpellUsageContext = createContext<SpellUsageContextValue>({
  hideGoodCasts: false,
  setHideGoodCasts: () => {
    // no-op
  },
});

export const SpellUsageContextProvider = ({ children }: { children: ReactNode }) => {
  const [hideGoodCasts, setHideGoodCasts] = useSessionFeatureFlag('hide-good-casts');
  const providerValue = useMemo(
    () => ({ hideGoodCasts, setHideGoodCasts }),
    [hideGoodCasts, setHideGoodCasts],
  );

  return <SpellUsageContext value={providerValue}>{children}</SpellUsageContext>;
};

export const useSpellUsageContext = () => use(SpellUsageContext);
