import { SpellIcon } from 'interface';
import { ControlledExpandable } from 'interface';
import { SubSection } from 'interface/guide';
import { CastEvent } from 'parser/core/Events';
import { useState } from 'react';
// type evangelismRamps = { evangelismRamps: CastEvent[][] };
type ramps = any;
type rampProblems = any;
// TODO : Add timestamps to each ramp - how do I get the combatlog Parser in here
// TODO : How do I make each drop down work independantly

const RampProblems = (problems: rampProblems) => {
  console.log(problems.problems);
  return (
    <>
      <ol>
        {problems.problems.map((problem: string) => (
          <li key={problems.problems.indexOf(problem)}>{problem}</li>
        ))}
      </ol>
    </>
  );
};

export const EvangelismApplicators = (ramps: ramps) => {
  const evangelisms = ramps.module.evangelismRamps;
  console.log(ramps.module.analyzeRamps);
  const [isExpanded, setIsExpanded] = useState(false);
  const casts = evangelisms.map((evangelism: CastEvent[], index: number) => (
    <>
      <div className="py-7">
        <ControlledExpandable
          header={`Evangelism ${evangelisms.indexOf(evangelism) + 1}`}
          element="section"
          expanded={isExpanded}
          inverseExpanded={() => setIsExpanded(!isExpanded)}
        >
          {evangelism.map((cast) => (
            <SpellIcon
              style={{ height: '42px' }}
              id={cast.ability.guid}
              key={evangelism.indexOf(cast)}
              noLink
            />
          ))}

          <SubSection title="Problems">
            Here's what you can improve on:
            <RampProblems problems={ramps.module.analyzeRamps[index]} />
          </SubSection>
        </ControlledExpandable>
      </div>
    </>
  ));
  return <>{casts}</>;
};
