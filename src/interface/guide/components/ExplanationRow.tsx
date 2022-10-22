import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { SubSection } from 'interface/guide/index';
import Explanation from 'interface/guide/components/Explanation';

const leftPercentDefault = 30;

/**
 * A container for holding two side-by-side panels, an explanation and data. By default, the left
 * side panel will be narrow. A future update will add a toggle to make the explanation panel
 * hidden and allow the data row to expand to full width.
 */
export default function ExplanationRow({
  children,
  leftPercent,
}: {
  children: ReactNode;
  leftPercent?: number;
}) {
  return (
    <StyledExplanationRow
      style={{ gridTemplateColumns: `${leftPercent || leftPercentDefault}% 1fr` }}
    >
      {children}
    </StyledExplanationRow>
  );
}

/** A helper to return explanation and data elements wrapped by a Subsection */
export function explanationAndDataSubsection(
  explanation: JSX.Element,
  data: JSX.Element,
  explanationPercent?: number,
) {
  return (
    <SubSection>
      <ExplanationRow leftPercent={explanationPercent}>
        <Explanation>{explanation}</Explanation>
        {data}
      </ExplanationRow>
    </SubSection>
  );
}

const StyledExplanationRow = styled.div`
  display: grid;
  grid-column-gap: 1em;
`;
