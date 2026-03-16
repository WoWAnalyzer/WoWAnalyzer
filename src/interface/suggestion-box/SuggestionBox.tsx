import { BadMark, GoodMark, PerfectMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode, useState, type JSX } from 'react';
import styles from './SuggestionBox.module.scss';

const className = (...classNames: Array<string | false>) => classNames.filter(Boolean).join(' ');

const OkMark = () => <i className={className(styles.fakeGlyphicon, 'ok-mark')}>!</i>;

const PerfIcon = {
  [QualitativePerformance.Ok]: <OkMark />,
  [QualitativePerformance.Good]: <GoodMark />,
  [QualitativePerformance.Fail]: <BadMark />,
  [QualitativePerformance.Perfect]: <PerfectMark />,
} satisfies Record<QualitativePerformance, ReactNode>;

export interface SuggestionBoxProps {
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
  performance: QualitativePerformance;
}

export default function SuggestionBox({
  title,
  description,
  children,
  performance,
}: SuggestionBoxProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const important =
    performance === QualitativePerformance.Ok || performance === QualitativePerformance.Fail;

  return (
    <div
      className={className(
        styles.container,
        important && styles.important,
        expanded && styles.expanded,
      )}
    >
      <div className={styles.header} onClick={() => setExpanded((s) => !s)}>
        <div className={styles.glyphIcon}>{PerfIcon[performance]}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
      <div className={styles.body}>{children}</div>
      <button className={styles.footer} onClick={() => setExpanded((s) => !s)}>
        <span>View Details</span>
      </button>
    </div>
  );
}
