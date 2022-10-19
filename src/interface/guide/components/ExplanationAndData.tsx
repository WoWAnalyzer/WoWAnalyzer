import styled from '@emotion/styled';
import { SubSection } from 'interface/guide/index';

// TODO docs
export type ExplanationAndDataRow = { explanation: JSX.Element; data: JSX.Element };

// TODO docs
export default function ExplanationAndData({ rows }: { rows: (ExplanationAndDataRow | false)[] }) {
  return (
    <>
      {rows.flatMap((r, i) =>
        !r ? (
          []
        ) : (
          <SubSection key={i}>
            <NarrowWideColumns>
              {r.explanation}
              {r.data}
            </NarrowWideColumns>
          </SubSection>
        ),
      )}
    </>
  );
}

const NarrowWideColumns = styled.div`
  display: grid;
  grid-template-columns: 30% 1fr;
  grid-column-gap: 1em;
`;
