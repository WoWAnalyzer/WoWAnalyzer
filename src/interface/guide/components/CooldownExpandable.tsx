import { JSX, ReactNode, useState } from 'react';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, SectionHeader } from 'interface/guide';
import { ControlledExpandable } from 'interface';
import EmbeddedTimeline, {
  EmbeddedTimelineProps,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import ThroughputTable, { ThroughputTableProps } from 'interface/Table/ThroughputTable';
import styles from './CooldownExpandable.module.scss';

export interface CooldownExpandableItem {
  label: ReactNode;
  result?: ReactNode;
  details?: ReactNode;
}

type RangeProps =
  | { range?: undefined; timeline?: undefined; table?: undefined }
  | {
      range: { start: number; end: number };
      /**
       * Enable the embedded timeline. See `EmbeddedTimeline`. Accepts the props of the `EmbeddedTimeline` component. Use `timeline={true}` if you just want default props.
       */
      timeline?: Omit<EmbeddedTimelineProps, 'range'> | true;
      /**
       * Enable the embedded throughput table. See `ThroughputTable`. Accepts the props of the `ThroughputTable` component.
       */
      table?: Omit<ThroughputTableProps, 'range'>;
    };

type Props = {
  header: ReactNode;
  checklistItems?: CooldownExpandableItem[];
  detailItems?: CooldownExpandableItem[];
  perf?: QualitativePerformance;
} & RangeProps;

export const CooldownExpandableDataItem = ({
  minWidth,
  ...item
}: CooldownExpandableItem & { minWidth?: number | string }): JSX.Element => (
  <tr>
    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: minWidth ?? '25em' }}>
      {item.label}
    </td>
    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result ? item.result : ''}</td>
    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
  </tr>
);

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
          <CooldownExpandableDataItem key={ix} {...item} />
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
  timeline,
  range,
  table,
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
  return (
    <ControlledExpandable
      header={<SectionHeader>{combinedHeader}</SectionHeader>}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
      // this allows animation transitions to function correctly with auto-height calculations when the timeline is enabled.
      disableDisplayNone={Boolean(timeline)}
    >
      {/* inert is used to prevent tabbing from getting trapped on the timeline while hidden */}
      <div inert={!isExpanded}>
        {range && timeline && (
          <EmbeddedTimeline range={range} {...(typeof timeline === 'boolean' ? {} : timeline)} />
        )}
        {checklistItems && checklistItems.length !== 0 && (
          <CooldownExpandableDataList items={checklistItems} title="Checklist" />
        )}
        {detailItems && detailItems.length !== 0 && (
          <CooldownExpandableDataList items={detailItems} title="Details" />
        )}
        {range && table && (
          <div className={styles.throughputTableContainer}>
            <ThroughputTable range={range} {...table} />
          </div>
        )}
      </div>
    </ControlledExpandable>
  );
};

export default CooldownExpandable;
