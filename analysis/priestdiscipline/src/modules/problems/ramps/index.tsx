import { SpellIcon } from 'interface';
import { ControlledExpandable } from 'interface';
import { CastEvent } from 'parser/core/Events';
import { useState, SetStateAction, Dispatch } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';

import Ramps, { ProblemHash } from './analyzer';
import './problems.scss';

type ApplicatorProps = { ramps: Ramps };

interface EvangContextInterface {
  module: Ramps;
}

export const EvangContext = createContext<EvangContextInterface | null>(null);

type EvangelismRampInfo = {
  rampInfo: RampInfo;
  evangelismTimestamp: string;
};

type RampInfo = CastEvent[];

type EvangelismRendererProps = { ramp: EvangelismRampInfo; index: number; problems: ProblemHash[] };
type ShowEvangelismCastsProps = {
  ramp: EvangelismRampInfo;
  index: number;
  isHighlighted: { index: number; problemDescription: string } | null;
  gcdsNeedingSpacers: number[];
};
type RenderEvangelismProblemsProps = {
  problems: ProblemHash[];
  isHighlighted: { index: number; problemDescription: string } | null;
  setIsHighlighted: Dispatch<SetStateAction<{ index: number; problemDescription: string } | null>>;
};

type CastSpacerProps = { wastedTime: number | undefined };

const ShowEvangelismCasts = (props: ShowEvangelismCastsProps) => {
  let problemStyle = '';
  const checkProblem = (problemType: string) => problemType;

  const setStyling = (index: number) => {
    problemStyle = '';

    if (!props.isHighlighted) {
      return problemStyle;
    }

    if (props.isHighlighted) {
      problemStyle += `${checkProblem(props.isHighlighted?.problemDescription)}-hovered`;
    }

    if (props.isHighlighted?.index === index) {
      return problemStyle;
    }
    return 'blurred ';
  };

  const gcdTimers = useContext(EvangContext);

  return (
    <>
      <h2>Evangelism{` ${props.index + 1} - ${props.ramp.evangelismTimestamp}`}</h2>
      <div className="evang-sequence">
        {props.ramp.rampInfo.map((cast: CastEvent) => {
          const spacer = props.gcdsNeedingSpacers.includes(props.ramp.rampInfo.indexOf(cast));
          const wastedTime = (index: number) =>
            gcdTimers?.module.analyzeRamps[props.index].find((problem) => problem.index === index)
              ?.gcdTime;
          return (
            <>
              <SpellIcon
                id={cast.ability.guid}
                key={props.ramp.rampInfo.indexOf(cast)}
                noLink
                className={'problem-icon ' + setStyling(props.ramp.rampInfo.indexOf(cast))}
              />
              <div className={spacer ? `sequence-spacer` : ''}>
                {' '}
                {spacer ? (
                  <CastSpacer wastedTime={wastedTime(props.ramp.rampInfo.indexOf(cast))} />
                ) : (
                  ''
                )}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

const CastSpacer = (props: CastSpacerProps) => {
  if (!props.wastedTime) {
    return <></>;
  }
  return (
    <>
      <p className="gcd-time">{`${(props.wastedTime / 1000).toFixed(1)}s`}</p>
      <svg id="right">
        <path
          d="M0.5 9.35772H20.9956L14.2001 2.29941L16.4134 0L27 11L16.4134 22L14.2001 19.7006L20.9956 12.6423H0.5V9.35772Z"
          fill="#000"
        ></path>
      </svg>
    </>
  );
};

const RenderEvangelismProblems = (props: RenderEvangelismProblemsProps) => (
  <>
    You had some problems:
    <ol>
      {props.problems.map((problem) => (
        <li
          key={props.problems.indexOf(problem)}
          onMouseEnter={() =>
            props.setIsHighlighted({
              index: problem.index,
              problemDescription: problem.problemType,
            })
          }
          onMouseLeave={() => props.setIsHighlighted(null)}
          className="problem"
        >
          <div className="problem-description">{problem.problemDescription}</div>
        </li>
      ))}
    </ol>
  </>
);

const getSpacers = (problems: ProblemHash[]) => problems.map((problem) => problem.index);

const EvangelismRenderer = (props: EvangelismRendererProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState<{
    index: number;
    problemDescription: string;
  } | null>(null);

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
          gcdsNeedingSpacers={getSpacers(
            props.problems.filter((problem) => problem.problemType === 'deadGCD'),
          )}
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
  const evangContext: EvangContextInterface = { module: props.ramps };
  return (
    <>
      <EvangContext.Provider value={evangContext}>
        {evangelismRamps.map((evangelismRamp, index: number) => (
          <>
            <EvangelismRenderer
              ramp={evangelismRamp}
              key={index}
              index={evangelismRamps.indexOf(evangelismRamp)}
              problems={rampProblems[index]}
            />
          </>
        ))}
      </EvangContext.Provider>
    </>
  );
};
