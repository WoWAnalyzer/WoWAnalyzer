import { SpellIcon } from 'interface';
import { ControlledExpandable } from 'interface';
import { CastEvent } from 'parser/core/Events';
import { useState, SetStateAction, Dispatch } from 'react';

import Ramps, { ProblemHash } from './analyzer';
import './problems.scss';
// type evangelismRamps = { evangelismRamps: CastEvent[][] };

type ApplicatorProps = { ramps: Ramps };

type EvangelismRampInfo = {
  rampInfo: RampInfo;
  evangelismTimestamp: string;
};

type RampInfo = CastEvent[];

type EvangelismRendererProps = { ramp: EvangelismRampInfo; index: number; problems: ProblemHash[] };
type ShowEvangelismCastsProps = {
  ramp: EvangelismRampInfo;
  index: number;
  isHighlighted: number | null;
};
type RenderEvangelismProblemsProps = {
  problems: ProblemHash[];
  isHighlighted: number | null;
  setIsHighlighted: Dispatch<SetStateAction<number | null>>;
};
// TODO: Now, I need to add some way to get the type of problem in the casts
const ShowEvangelismCasts = (props: ShowEvangelismCastsProps) => {
  let styling = '';

  const setStyling = (index: number) => {
    if (props.isHighlighted === index) {
      styling = 'dead-gcd';
    } else {
      styling = '';
    }
  };

  return (
    <>
      <h2>Evangelism{` ${props.index + 1} - ${props.ramp.evangelismTimestamp}`}</h2>
      {props.ramp.rampInfo.map((cast: CastEvent) => {
        setStyling(props.ramp.rampInfo.indexOf(cast));
        return (
          <>
            <SpellIcon
              id={cast.ability.guid}
              key={props.ramp.rampInfo.indexOf(cast)}
              noLink
              className={'problem-icon ' + styling}
            />
          </>
        );
      })}
    </>
  );
};

const RenderEvangelismProblems = (props: RenderEvangelismProblemsProps) => (
  <>
    Here the problems will be displayed
    <ol>
      {props.problems.map((problem) => (
        <li
          key={props.problems.indexOf(problem)}
          onMouseEnter={() => props.setIsHighlighted(problem.index)}
          onMouseLeave={() => props.setIsHighlighted(null)}
        >
          {problem.problemDescription}
        </li>
      ))}
    </ol>
  </>
);

const EvangelismRenderer = (props: EvangelismRendererProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState<number | null>(null);

  return (
    <>
      <ControlledExpandable
        header={`Evangelism ${props.index + 1} - ${props.ramp.evangelismTimestamp}`}
        element="section"
        expanded={isExpanded}
        inverseExpanded={() => setIsExpanded(!isExpanded)}
      >
        <ShowEvangelismCasts
          ramp={props.ramp}
          key={props.index}
          index={props.index}
          isHighlighted={isHighlighted}
        />{' '}
        <br />
        <RenderEvangelismProblems
          problems={props.problems}
          isHighlighted={isHighlighted}
          setIsHighlighted={setIsHighlighted}
        />
      </ControlledExpandable>
    </>
  );
};

export const EvangelismApplicators = (props: ApplicatorProps) => {
  const evangelismRamps = props.ramps.evangelismRamps;
  const rampProblems = props.ramps.analyzeRamps;
  return (
    <>
      {evangelismRamps.map((evangelismRamp, index: number) => (
        <>
          <EvangelismRenderer
            ramp={evangelismRamp}
            key={index}
            index={evangelismRamps.indexOf(evangelismRamp)}
            problems={rampProblems[index]}
          />
          <br />
        </>
      ))}
    </>
  );
};
