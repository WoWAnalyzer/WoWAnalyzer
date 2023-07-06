import { formatDuration } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export type CastPerformanceEntry = {
  value: QualitativePerformance;
  description?: JSX.Element;
  spellId?: number;
  timestamp: number;
};

type CastPerformanceBoxProps = {
  entries: CastPerformanceEntry[];
  startTime: number;
};

const ValueToDescription = {
  [QualitativePerformance.Perfect]: 'Great',
  [QualitativePerformance.Good]: 'Good',
  [QualitativePerformance.Ok]: 'Ok',
  [QualitativePerformance.Fail]: 'Bad',
};

/**
 *  A wrapper around the PerformanceRowBox that does extra formatting for spell
 *  events.  It adds a description, spell links and timestamp to the tooltips.
 */
export const CastPerformanceBox: React.VFC<CastPerformanceBoxProps> = ({ entries, startTime }) => (
  <PerformanceBoxRow
    values={entries.map((entry) => ({
      value: entry.value,
      tooltip: <Tooltip entry={entry} startTime={startTime} />,
    }))}
  />
);

const Tooltip = ({ entry, startTime }: { entry: CastPerformanceEntry; startTime: number }) => {
  if (entry.description) {
    return (
      <>
        {ValueToDescription[entry.value]}: {entry.description} @{' '}
        {formatDuration(entry.timestamp - startTime)}
      </>
    );
  }
  if (entry.spellId) {
    return (
      <>
        {ValueToDescription[entry.value]}: <SpellLink id={entry.spellId} /> @{' '}
        {formatDuration(entry.timestamp - startTime)}
      </>
    );
  }
  return (
    <>
      {ValueToDescription[entry.value]} @ {formatDuration(entry.timestamp - startTime)}
    </>
  );
};
