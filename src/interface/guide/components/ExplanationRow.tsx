import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { SubSection } from 'interface/guide/index';
import Explanation from 'interface/guide/components/Explanation';

export const leftPercentDefault = 30;

/**
 * A container for holding two side-by-side panels, an explanation and data. By default, the left
 * side panel will be narrow. A future update will add a toggle to make the explanation panel
 * hidden and allow the data row to expand to full width.
 */
export default function ExplanationRow({
  children,
  leftPercent,
  leftHide,
}: {
  children: ReactNode;
  leftPercent?: number;
  leftHide?: boolean;
}) {
  return (
    <StyledExplanationRow
      style={{
        gridTemplateColumns: leftHide ? '1fr' : `${leftPercent ?? leftPercentDefault}% 1fr`,
      }}
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
  hideExplanation?: boolean,
) {
  return (
    <ExplanationAndDataSubSection
      explanation={explanation}
      data={data}
      explanationPercent={explanationPercent}
      hideExplanation={hideExplanation}
    />
  );
}

export function ExplanationAndDataSubSection({
  explanation,
  data,
  explanationPercent,
  hideExplanation,
}: {
  explanation: ReactNode;
  data: ReactNode;
  explanationPercent?: number;
  hideExplanation?: boolean;
}) {
  return (
    <SubSection>
      <ExplanationRow leftHide={hideExplanation} leftPercent={explanationPercent}>
        <Explanation
          style={{
            display: hideExplanation ? 'none' : undefined,
          }}
          aria-hidden={hideExplanation}
        >
          {explanation}
        </Explanation>
        {data}
      </ExplanationRow>
    </SubSection>
  );
}

const StyledExplanationRow = styled.div`
  display: grid;
  grid-column-gap: 1em;
`;
