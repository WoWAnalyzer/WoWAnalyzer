import { ReactNode, useState } from 'react';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, SectionHeader, useEvents, useInfo } from 'interface/guide';
import { ControlledExpandable } from 'interface';
import {
  AutoSizerTimelineContainer,
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import TimeIndicators from 'interface/report/Results/Timeline/TimeIndicators';

export interface CooldownExpandableItem {
  label: ReactNode;
  result?: ReactNode;
  details?: ReactNode;
}

interface BaseProps {
  header: ReactNode;
  checklistItems?: CooldownExpandableItem[];
  detailItems?: CooldownExpandableItem[];
  perf?: QualitativePerformance;
}

interface TimeRange {
  start: number;
  end: number;
}

interface TimelineExtProps {
  range: TimeRange;
  showTimeline: boolean;
}

type Props =
  | (BaseProps & TimelineExtProps)
  | (BaseProps & Partial<{ [k in keyof TimelineExtProps]: undefined }>);

/**
 * The data list used to display Checklist and Details sections in `CooldownExpandable`
 */
export const CooldownExpandableDataList = ({
  items,
  title,
}: {
  items: CooldownExpandableItem[];
  title: ReactNode;
}) => (
  <section>
    <header style={{ fontWeight: 'bold' }}>{title}</header>
    <table>
      <tbody>
        {items.map((item, ix) => (
          <tr key={ix}>
            <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
              {item.label}
            </td>
            <td style={{ paddingRight: '1em', textAlign: 'right' }}>
              {item.result ? item.result : ''}
            </td>
            {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

const CooldownExpandable = ({
  header,
  checklistItems,
  detailItems,
  perf,
  range,
  showTimeline,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const combinedHeader =
    perf !== undefined ? (
      <div>
        {header} &mdash; <PerformanceMark perf={perf} />
      </div>
    ) : (
      header
    );
  const info = useInfo();
  const events = useEvents();
  const filteredEvents = showTimeline
    ? events.filter((event) => event.timestamp >= range.start && event.timestamp <= range.end)
    : [];
  return (
    <ControlledExpandable
      header={<SectionHeader>{combinedHeader}</SectionHeader>}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      <div>
        {showTimeline && (
          <AutoSizerTimelineContainer secondsShown={(range.end - range.start) / 1000}>
            <SpellTimeline>
              <TimeIndicators
                seconds={(range.end - range.start) / 1000}
                offset={range.start - (info?.originalFightStart ?? 0)}
                skipInterval={2}
              >
                <Casts
                  start={range.start}
                  windowStart={range.start}
                  movement={undefined}
                  events={filteredEvents}
                />
              </TimeIndicators>
            </SpellTimeline>
          </AutoSizerTimelineContainer>
        )}
        {checklistItems && checklistItems.length !== 0 && (
          <CooldownExpandableDataList items={checklistItems} title="Checklist" />
        )}
        {detailItems && detailItems.length !== 0 && (
          <CooldownExpandableDataList items={detailItems} title="Details" />
        )}
      </div>
    </ControlledExpandable>
  );
};

export default CooldownExpandable;
