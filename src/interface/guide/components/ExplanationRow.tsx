import { ReactNode, type JSX } from 'react';
import { SubSection } from 'interface/guide/index';
import Explanation, { useExplanationContext } from 'interface/guide/components/Explanation';

import styles from './ExplanationRow.module.scss';

const leftPercentDefault = 30;

/**
 * A container for holding two side-by-side panels, an explanation and data. By default, the left
 * side panel will be narrow.
 */
export default function ExplanationRow({
  children,
  leftPercent,
}: {
  children: ReactNode;
  leftPercent?: number;
}) {
  const { hideExplanations } = useExplanationContext();
  return (
    <div
      className={styles.row}
      style={{
        gridTemplateColumns: hideExplanations ? '1fr' : `${leftPercent ?? leftPercentDefault}% 1fr`,
      }}
    >
      {children}
    </div>
  );
}

/** A helper to return explanation and data elements wrapped by a Subsection */
export function explanationAndDataSubsection(
  explanation: JSX.Element,
  data: JSX.Element,
  explanationPercent?: number,
  title?: string,
) {
  return (
    <ExplanationAndDataSubSection
      explanation={explanation}
      data={data}
      explanationPercent={explanationPercent}
      title={title}
    />
  );
}

interface ExplanationAndDataSubSectionProps {
  explanation: ReactNode;
  data: ReactNode;
  explanationPercent?: number;
  title?: string | ReactNode;
}
export function ExplanationAndDataSubSection({
  explanation,
  data,
  explanationPercent,
  title,
}: ExplanationAndDataSubSectionProps) {
  return (
    <SubSection title={title}>
      <ExplanationRow leftPercent={explanationPercent}>
        <Explanation>{explanation}</Explanation>
        {data}
      </ExplanationRow>
    </SubSection>
  );
}
