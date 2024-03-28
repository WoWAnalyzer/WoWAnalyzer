import styled from '@emotion/styled';
import { BadMark, GoodMark, OkMark, PerfectMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode, useState } from 'react';
const Header = styled.div`
  padding: 0.25em 0.75em 0.5em 0.75em;
  border-radius: 4px 4px 0 0;
  display: grid;
  grid-template-areas: 'icon title' 'icon desc';
  grid-template-columns: max-content 1fr;
  grid-template-rows: auto auto;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  gap: 0 1em;
`;

const Footer = styled.button`
  appearance: none;
  background: none;
  border: none;
  width: 100%;
  border-radius: 0 0 4px 4px;
  border-top: 2px solid hsla(0, 0%, 0%, 20%);
  display: flex;
  flex-direction: row;
  justify-content: end;
  padding: 0.25em 0.75em;

  &:focus {
    outline: none;
  }

  color: #fab700;
`;

const Body = styled.div``;

const Container = styled.div<{ important?: boolean }>`
  border-radius: 4px;
  background-color: hsl(0, 0%, ${(props) => (props.important ? '15%' : '10%')});

  & > ${Header} {
    background-color: hsl(0, 0%, ${(props) => (props.important ? '18%' : '13%')});
  }

  &:has(> ${Header}:hover, > ${Footer}:hover, > ${Footer}:focus) {
    box-shadow: 0px 0px 2px 2px rgba(250, 183, 0, 0.9);
    cursor: pointer;
  }

  & > ${Body} {
    padding: 0 1em;
    max-height: 0;
    transition:
      max-height 0.15s ease-out,
      padding-top 0.15s ease-out,
      padding-bottom 0.15s ease-out;
    overflow: hidden;
  }

  &.expanded > ${Body} {
    padding: 0.5em 1em;
    max-height: 999px;
    transition:
      max-height 0.15s ease-out,
      padding-top 0.14s ease-out,
      padding-bottom 0.14s ease-out;
  }
`;

const GlyphIcon = styled.div`
  grid-area: icon;
  font-weight: bold;
  font-size: 300%;
  padding: 0 0.35em;
  display: flex;
  flex-direction: row;
  align-items: center;

  & > .bad-mark {
    color: hsl(
      349,
      100%,
      43%
    ); /* little hack to brighten up the bad mark since we're brightening the bg */
  }
`;

const Title = styled.div`
  grid-area: title;
  font-size: 130%;
  align-self: end;
`;

const Description = styled.div`
  grid-area: desc;
  align-self: start;
  font-size: 100%;
  color: hsl(44, 6%, 78%);
`;

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
      important={
        performance === QualitativePerformance.Ok || performance === QualitativePerformance.Fail
      }
      className={expanded ? 'expanded' : ''}
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
