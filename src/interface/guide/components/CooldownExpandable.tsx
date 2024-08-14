import { ReactNode, useState } from 'react';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, SectionHeader } from 'interface/guide';
import { ControlledExpandable } from 'interface';

export interface CooldownExpandableItem {
  label: ReactNode;
  result?: ReactNode;
  details?: ReactNode;
}

interface Props {
  header: ReactNode;
  checklistItems?: CooldownExpandableItem[];
  detailItems?: CooldownExpandableItem[];
  perf?: QualitativePerformance;
}

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

const CooldownExpandable = ({ header, checklistItems, detailItems, perf }: Props) => {
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
    >
      <div>
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
