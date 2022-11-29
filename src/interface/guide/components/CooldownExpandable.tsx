import { ReactNode, useState } from 'react';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, SectionHeader } from 'interface/guide';
import { ControlledExpandable } from 'interface';

export interface CooldownExpandableItem {
  label: ReactNode;
  result: ReactNode;
  details?: ReactNode;
}

interface Props {
  header: ReactNode;
  checklistItems?: CooldownExpandableItem[];
  detailItems?: CooldownExpandableItem[];
  perf?: QualitativePerformance;
}
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
          <section>
            <header style={{ fontWeight: 'bold' }}>Checklist</header>
            <tbody>
              <table>
                {checklistItems.map((item, ix) => (
                  <tr key={'checklist-' + ix}>
                    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
                      {item.label}
                    </td>
                    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result}</td>
                    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
                  </tr>
                ))}
              </table>
            </tbody>
          </section>
        )}
        {detailItems && detailItems.length !== 0 && (
          <section>
            <tbody>
              <header style={{ fontWeight: 'bold' }}>Details</header>
              <table>
                {detailItems.map((item, ix) => (
                  <tr key={'details-' + ix}>
                    <td style={{ paddingRight: '1em', paddingLeft: '1em', minWidth: '25em' }}>
                      {item.label}
                    </td>
                    <td style={{ paddingRight: '1em', textAlign: 'right' }}>{item.result}</td>
                    {item.details && <td style={{ paddingRight: '1em' }}>{item.details}</td>}
                  </tr>
                ))}
              </table>
            </tbody>
          </section>
        )}
      </div>
    </ControlledExpandable>
  );
};

export default CooldownExpandable;
