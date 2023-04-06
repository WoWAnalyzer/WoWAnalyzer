import styled from '@emotion/styled';
import PassFailBar from './PassFailBar';

export type CastData<Reason> = {
  reason: Reason;
};

export type Props<Reason, Data extends CastData<Reason>> = {
  casts: Data[];
  label: (reason: Reason) => React.ReactNode;
  containerType?: React.ElementType<any>;
  possibleReasons: Reason[];
  badReason: Reason;
};

const Container = styled.tbody``;

const ReasonRow = styled.tr<{ bad: boolean }>`
  .fail-bar {
    background-color: transparent;
  }

  .pass-bar {
    ${(props) => (props.bad ? 'background-color: hsl(348.9, 69.5%, 39.8%);' : '')}
    border-radius: 2px;
  }
`;

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
        <ReasonRow key={index} bad={reason === badReason}>
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
