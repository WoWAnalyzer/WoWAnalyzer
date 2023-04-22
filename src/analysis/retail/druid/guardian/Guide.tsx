import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/guardian/CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import IronfurSection from 'analysis/retail/druid/guardian/modules/spells/IronfurGuideSection';
import { ResourceLink, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';
import { PERFECT_TIME_AT_FURY_CAP } from 'analysis/retail/demonhunter/vengeance/modules/resourcetracker/FuryTracker';
import {
  GOOD_TIME_AT_RAGE_CAP,
  OK_TIME_AT_RAGE_CAP,
  RAGE_SCALE_FACTOR,
} from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';
// import { Highlight } from 'interface/Highlight';
// import Explanation from 'interface/guide/components/Explanation';
// import { TooltipElement } from 'interface';
// import { useCallback, useState } from 'react';
// import { MAJOR_ANALYZERS } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/config';
// import { SignalListener } from 'react-vega';
// import { DamageMitigationChart } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/components/DamageMitigationChart';
// import { AutoSizer } from 'react-virtualized';
// import Analyzer from 'parser/core/Analyzer';
// import styled from '@emotion/styled/dist/emotion-styled.cjs';
// import { ApplyBuffEvent, EventType } from 'parser/core/Events';
// import { buffId, MAJOR_DEFENSIVES } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/DefensiveBuffs';
// import { defensiveExpiration } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/DefensiveBuffLinkNormalizer';
// import { useMaxMitigationValue } from 'analysis/retail/monk/brewmaster/modules/core/MajorDefensives/components/Timeline';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IronfurSection />
      <RageSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      {/*<MajorDefensivesSection />*/}
      <PreparationSection />
    </>
  );
}

// TODO move to own Rage class?
function RageSection({ modules }: GuideProps<typeof CombatLogParser>): JSX.Element {
  return (
    <Section title="Rage">
      <p>
        Guardian's primary resource is <ResourceLink id={RESOURCE_TYPES.RAGE.id} />. It's generated
        as part of your normal rotation, and can be consumed either defensively (with{' '}
        <SpellLink spell={SPELLS.IRONFUR} /> / <SpellLink spell={SPELLS.FRENZIED_REGENERATION} />)
        or offesnively (with <SpellLink spell={SPELLS.MAUL} /> /{' '}
        <SpellLink spell={TALENTS_DRUID.RAZE_TALENT} />
        ). You should always spend your Rage before capping, as lost generation is lost
        effectiveness. <SpellLink spell={SPELLS.IRONFUR} /> is not on the GCD - excess rage can
        always be instantly turned into extra stacks.
      </p>
      <p>
        The chart below shows your Rage over the course of the encounter. You wasted{' '}
        <PerformancePercentage
          performance={modules.rageTracker.wastedPerformance}
          perfectPercentage={PERFECT_TIME_AT_FURY_CAP}
          goodPercentage={GOOD_TIME_AT_RAGE_CAP}
          okPercentage={OK_TIME_AT_RAGE_CAP}
          percentage={modules.rageTracker.percentAtCap}
          flatAmount={modules.rageTracker.wasted * RAGE_SCALE_FACTOR}
        />{' '}
        of your <ResourceLink id={RESOURCE_TYPES.RAGE.id} />.
      </p>
      {modules.rageGraph.plot}
    </Section>
  );
}

function RotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return <Section title="Rotation">TODO TODO TODO</Section>;
}

// function MajorDefensivesSection(): JSX.Element | null {
// return (
//   <Section title="Major Defensives">
//     <Explanation>
//       <p>
//         Effectively using your defensive cooldowns is a core part of playing tank well.
//         Guardian in particular must use cooldowns to effectively mitigate big magic damage.
//       </p>
//       <p>There are two things you should look for in your cooldown usage:</p>
//       <ol>
//         <li>
//           You should cover as many{' '}
//           <TooltipElement
//             content={
//               <>
//                 A <strong>damage spike</strong> is when you take much more damage than normal in a
//                 small amount of time. These are visible on the Timeline below as tall spikes.
//               </>
//             }
//           >
//             damage spikes
//           </TooltipElement>{' '}
//           as possible, and use any left over to cover periods of heavy, consistent damage.
//           <br />
//           <small>
//             In the damage chart below, a spike highlighted in{' '}
//             <Highlight color={GoodColor} textColor="black">
//               green
//             </Highlight>{' '}
//             was covered by a defensive.
//           </small>
//         </li>
//         <li>
//           You should <em>use</em> your cooldowns. This may seem silly&mdash;but not using major
//           defensives is a common problem! For Guardian, it is also likely to be fatal.
//           <br />
//           <small>
//             Below the damage chart, your cooldowns are shown. Large gaps may indicate that you
//             could get more uses&mdash;but remember that covering spikes is more important than
//             maximizing total casts!
//           </small>
//         </li>
//       </ol>
//     </Explanation>
//     {/*<SubSection title="Timeline">*/}
//     {/*  <MajorDefensiveTimeline />*/}
//     {/*</SubSection>*/}
//     {/*<MajorDefensiveUsagesList />*/}
//   </Section>
// );
// }

//
// type HoverKey = {
//   analyzerClass: typeof Analyzer;
//   startTime: number;
// };
//
// const BuffTimelineContainer = styled.div`
//   margin-left: 48px;
// `;
//
// const BuffDisplay = ({ hoverKey }: { hoverKey: HoverKey | null }) => {
//   const info = useInfo();
//   const events = useEvents();
//   const analyzers = useAnalyzers(MAJOR_ANALYZERS);
//
//   const tooltipData = useCallback(
//     (event: ApplyBuffEvent) => {
//       const analyzer = analyzers?.find((analyzer) => analyzer.appliesToEvent(event));
//       const mit = analyzer?.mitigations.find((mit) => mit.start.timestamp === event.timestamp);
//
//       if (!mit) {
//         return undefined;
//       }
//
//       return {
//         mitigation: mit,
//         segments: analyzer!.mitigationSegments(mit),
//       };
//     },
//     [analyzers],
//   );
//
//   const maxValue = useMaxMitigationValue();
//
//   if (!info) {
//     return null;
//   }
//
//   const buffEvents = events
//     .filter(
//       (event): event is ApplyBuffEvent =>
//         event.type === EventType.ApplyBuff &&
//         MAJOR_DEFENSIVES.some((data) => buffId(data) === event.ability.guid),
//     )
//     .map((event) => {
//       const expirationTime = defensiveExpiration(event)?.timestamp ?? info.fightEnd;
//
//       return {
//         externalHover: event.timestamp - info.fightStart === hoverKey?.startTime,
//         start: event.timestamp - info.fightStart,
//         end: expirationTime - info.fightStart,
//         ability: event.ability,
//         tooltipData: tooltipData(event),
//       };
//     });
//
//   return (
//     <BuffBarContainer>
//       {buffEvents.map(({ start, end, ability, externalHover, tooltipData }) => (
//         <Tooltip
//           key={`${start}-${ability.guid}`}
//           hoverable
//           content={
//             tooltipData ? (
//               <BuffTooltip {...tooltipData} maxValue={maxValue} />
//             ) : (
//               'Unable to locate mitigation data'
//             )
//           }
//           isOpen={externalHover || undefined}
//         >
//           <BuffBar start={start} end={end} fightDuration={info.fightDuration} />
//         </Tooltip>
//       ))}
//     </BuffBarContainer>
//   );
// };
//
// function MajorDefensiveTimeline(): JSX.Element | null {
//   const info = useInfo();
//   const [chartHover, setChartHover] = useState<HoverKey | null>(null);
//
//   const onHover = useCallback((_event: string, item: { key: string[]; startTime: number[] }) => {
//     if (item.key === undefined) {
//       setChartHover(null);
//     } else {
//       setChartHover({
//         // by construction: we will always find an analyzer
//         analyzerClass: MAJOR_ANALYZERS.find((analyzer) => analyzer.name === item.key[0])!,
//         startTime: item.startTime[0],
//       });
//     }
//   }, []) as SignalListener;
//
//   if (!info) {
//     return null;
//   }
//
//   return (
//     <>
//       <DamageMitigationChart onHover={onHover} />
//       <BuffTimelineContainer>
//         <BuffDisplay hoverKey={chartHover} />
//         <AutoSizer disableHeight>{(props) => <DefensiveTimeline {...props} />}</AutoSizer>
//       </BuffTimelineContainer>
//     </>
//   );
