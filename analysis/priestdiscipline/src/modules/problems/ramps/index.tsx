import { SpellIcon } from 'interface';
import { CastEvent } from 'parser/core/Events';

import Ramps from './analyzer';

import './problems.scss';
// type evangelismRamps = { evangelismRamps: CastEvent[][] };

type ApplicatorProps = { ramps: Ramps };
type AnalyzeCastProps = { ramp: EvangelismRampInfo };

type EvangelismRampInfo = {
  rampInfo: RampInfo;
  evangelismTimestamp: string;
};
type RampInfo = CastEvent[];

const AnalyzeEvangelismCast = (props: AnalyzeCastProps) => {
  console.log(props.ramp.rampInfo);
  return (
    <>
      {props.ramp.rampInfo.map((cast: CastEvent) => (
        <SpellIcon
          id={cast.ability.guid}
          key={props.ramp.rampInfo.indexOf(cast)}
          noLink
          className={`${props.ramp.rampInfo.indexOf(cast)} problem-icon`}
        />
      ))}
    </>
  );
};

export const EvangelismApplicators = (props: ApplicatorProps) => {
  const evangelismRamps = props.ramps.evangelismRamps;
  return (
    <>
      {evangelismRamps.map((evangelismRamp, index: number) => (
        <>
          <AnalyzeEvangelismCast ramp={evangelismRamp} key={index} />
          <br />
        </>
      ))}
    </>
  );
};
// TODO : Add timestamps to each ramp - how do I get the combatlog Parser in here
// TODO : How do I make each drop down work independantly
// TODO: How do I add a hover to one icon / descrption and make the other highlighted

// const RampProblems = (problems: rampProblems) => (
//   <>
//     <ol>
//       {problems.problems.map((problem: ProblemHash) => (
//         <li id={`problemdescription-${problem.index}`} key={problems.problems.indexOf(problem)}>
//           {problem.problemDescription}
//         </li>
//       ))}
//     </ol>
//   </>
// );

// export const EvangelismApplicators = (ramps: ramps) => {
//   const evangelisms = ramps.module.evangelismRamps;
//   let styling = '';
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);

//   const handleMouseOver = () => {
//     setIsHovering(true);
//   };

//   const handleMouseOut = () => {
//     setIsHovering(false);
//   };

//   const iconStyle = (index: number) => {
//     styling = '';
//     ramps.module.analyzeRamps[index].forEach((problemSet: ProblemHash) => {
//       if (problemSet.index === index) {
//         styling += `${problemSet.problemType} ${isHovering ? 'hover-problem' : ''}`;
//       }
//     });
//     return styling;
//   };

//   const casts = evangelisms.map((evangelism: CastEvent[], index: number) => (
//     <>
//       <div className="py-7">
//         <ControlledExpandable
//           header={`Evangelism ${evangelisms.indexOf(evangelism) + 1}`}
//           element="section"
//           expanded={isExpanded}
//           inverseExpanded={() => setIsExpanded(!isExpanded)}
//         >
//           {evangelism.map((cast, castIndex) => (
//             <SpellIcon
//               id={cast.ability.guid}
//               key={evangelism.indexOf(cast)}
//               noLink
//               className={`${iconStyle(castIndex)} problem-icon`}
//               onMouseOver={handleMouseOver}
//               onMouseOut={handleMouseOut}
//             />
//           ))}

//           <SubSection title="Problems">
//             Here's what you can improve on:
//             <RampProblems problems={ramps.module.analyzeRamps[index]} />
//           </SubSection>
//         </ControlledExpandable>
//       </div>
//     </>
//   ));
//   return <>{casts}</>;
// };
