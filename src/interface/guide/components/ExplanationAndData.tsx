import styled from '@emotion/styled';
import { SubSection } from 'interface/guide/index';

/**
 * An explanation and some data based on that explanation, presented side by side.
 * The explanation section will be narrow and the data section wide.
 */
export type ExplanationAndDataRow = { explanation: JSX.Element; data: JSX.Element };

/**
 * A panel containing multiple rows of explanation / data.
 *
 * NOTE: future work may add a 'reduce explanations' toggle, which is planned to hide the
 * explanation column and allow the data column to expand to full width.
 */
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
