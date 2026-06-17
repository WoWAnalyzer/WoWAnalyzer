import cssComponent from 'interface/utils/css-component';
import styles from './SuggestionBox.module.scss';
import { BadMark, GoodMark, PerfectMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode, useState, type JSX } from 'react';
import clsx from 'clsx';
const Header = cssComponent('div', styles.Header, [] as const);

const Footer = cssComponent('button', styles.Footer, [] as const);

const Body = cssComponent('div', styles.Body, [] as const);

const Container = cssComponent('div', styles.Container, ['important'] as const);

const GlyphIcon = cssComponent('div', styles.GlyphIcon, [] as const);

const Title = cssComponent('div', styles.Title, [] as const);

const Description = cssComponent('div', styles.Description, [] as const);

const FakeGlyphicon = cssComponent('i', styles.FakeGlyphicon, [] as const);

const OkMark = () => <FakeGlyphicon className="ok-mark">!</FakeGlyphicon>;

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
  return (
    <Container
      className={clsx({
        [styles.expanded]: expanded,
        [styles.important]:
          performance === QualitativePerformance.Ok || performance === QualitativePerformance.Fail,
      })}
    >
      <Header onClick={() => setExpanded((s) => !s)}>
        <GlyphIcon>{PerfIcon[performance]}</GlyphIcon>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Header>
      <Body>{children}</Body>
      <Footer onClick={() => setExpanded((s) => !s)}>
        <span>View Details</span>
      </Footer>
    </Container>
  );
}
