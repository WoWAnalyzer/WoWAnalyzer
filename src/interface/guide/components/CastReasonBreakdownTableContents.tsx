import cssComponent from 'interface/utils/css-component';
import styles from './CastReasonBreakdownTableContents.module.scss';
import PassFailBar from './PassFailBar';
import { ElementType, ReactNode, type JSX } from 'react';
import clsx from 'clsx';

interface CastData<Reason> {
  reason: Reason;
}

interface Props<Reason, Data extends CastData<Reason>> {
  casts: Data[];
  label: (reason: Reason) => ReactNode;
  containerType?: ElementType;
  possibleReasons: Reason[];
  badReason?: Reason;
}

const Container = cssComponent('tbody', styles.Container, [] as const);

const ReasonRow = cssComponent('tr', styles.ReasonRow, [] as const);

/**
 * A `tbody` (by default, override via `containerType` prop) listing out the reasons for casts of an ability.
 */
export default function CastReasonBreakdownTableContents<Reason, Data extends CastData<Reason>>({
  casts,
  label,
  possibleReasons,
  containerType,
  badReason,
}: Props<Reason, Data>): JSX.Element {
  const counts = casts.reduce<Map<Reason, number>>((total, { reason }) => {
    total.set(reason, (total.get(reason) ?? 0) + 1);
    return total;
  }, new Map());

  const total = casts.length;

  return (
    <Container as={containerType}>
      {possibleReasons.map((reason, index) => (
        <ReasonRow key={index} className={clsx(reason === badReason && styles.bad)}>
          <td>{label(reason)}</td>
          <td className="pass-fail-counts">{counts.get(reason) ?? 0}</td>
          <td>
            <PassFailBar pass={counts.get(reason) ?? 0} total={total} />
          </td>
        </ReasonRow>
      ))}
    </Container>
  );
}
