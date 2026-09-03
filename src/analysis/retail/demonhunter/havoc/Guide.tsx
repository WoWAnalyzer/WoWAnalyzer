import { GoodColor, GuideProps, Section, SubSection, useAnalyzers } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { ResourceLink, SpellLink } from 'interface';
import { Highlight } from 'interface/Highlight';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CombatLogParser from './CombatLogParser';
import CooldownGraphSubsection from './guide/CooldownGraphSubSection';
import {
  GOOD_TIME_AT_FURY_CAP,
  OK_TIME_AT_FURY_CAP,
  PERFECT_TIME_AT_FURY_CAP,
} from './modules/resourcetracker/FuryTracker';
import FuryCapWaste from './guide/FuryCapWaste';
import { HideGoodCastsToggle } from 'interface/guide/components/HideGoodCastsToggle';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import Blur from './modules/spells/Blur';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      {/* <RotationSection modules={modules} events={events} info={info} /> Removing for now, maybe put APL here later*/}
      <DefensivesSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ info, modules }: GuideProps<typeof CombatLogParser>) {
  const percentAtFuryCap = modules.furyTracker.percentAtCap;
  const percentAtFuryCapPerformance = modules.furyTracker.percentAtCapPerformance;
  const furyWasted = modules.furyTracker.wasted;
  return (
    <Section title="Core">
      <SubSection title="Fury">
        <p>
          Havoc's primary resource is <ResourceLink id={RESOURCE_TYPES.FURY.id} />. You should avoid
          capping <ResourceLink id={RESOURCE_TYPES.FURY.id} /> - lost{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> generation is lost DPS.
        </p>
        <FuryCapWaste
          percentAtCap={percentAtFuryCap}
          percentAtCapPerformance={percentAtFuryCapPerformance}
          wasted={furyWasted}
          perfectTimeAtFuryCap={PERFECT_TIME_AT_FURY_CAP}
          goodTimeAtFuryCap={GOOD_TIME_AT_FURY_CAP}
          okTimeAtFuryCap={OK_TIME_AT_FURY_CAP}
        />
        {modules.furyGraph.plot}
      </SubSection>
      <SubSection title="Active Time">
        <p>
          <b>
            Continuously casting throughout an encounter is the single most important thing for
            achieving good DPS.
          </b>
          {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
          <br />
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible - do the best you can.
        </p>
        <p>
          Active Time:{' '}
          <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
            {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
          </PerformanceStrong>{' '}
        </p>
        <ActiveTimeGraph
          activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
      </SubSection>
    </Section>
  );
}

function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <HideExplanationsToggle id="hide-explanations-cooldowns" />
      <HideGoodCastsToggle id="hide-good-casts-cooldowns" />
      <CooldownGraphSubsection />
      <CooldownUsage analyzer={modules.eyeBeam} title="Eye Beam" />
      {modules.eternalHunt.guideSubsection()}
      {info.combatant.hasTalent(TALENTS.ESSENCE_BREAK_TALENT) &&
        modules.essenceBreakGuide.guideSubsection}

      {info.combatant.hasTalent(TALENTS.ART_OF_THE_GLAIVE_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink spell={TALENTS.ART_OF_THE_GLAIVE_TALENT} /> coming
            soon!
          </div>,
          <></>,
        )}
    </Section>
  );
}

// Commenting out to avoid errors

// function RotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
//   return (
//     <Section title="Rotation">
//       <HideExplanationsToggle id="hide-explanations-rotations" />
//       <HideGoodCastsToggle id="hide-good-casts-rotations" />
//       <p>
//         Havoc does not have a single rigid rotation. Your priority changes with your talent choices,
//         with different builds leaning into different burst windows, buff upkeep, and cooldown
//         pairings.
//       </p>
//       {modules.inertia.guideSubsection()}
//       {/* {modules.throwGlaive.guideSubsection()} */}
//       {info.combatant.hasTalent(TALENTS.ESSENCE_BREAK_TALENT) &&
//         explanationAndDataSubsection(
//           <div>
//             Per-cast breakdown for <SpellLink spell={TALENTS.ESSENCE_BREAK_TALENT} /> coming soon!
//           </div>,
//           <></>,
//         )}
//     </Section>
//   );
// }

function DefensivesSection({ modules }: GuideProps<typeof CombatLogParser>) {
  const defensiveAnalyzers = useAnalyzers([Blur]);

  return (
    <Section title="Defensives">
      <p>
        <SpellLink spell={SPELLS.BLUR} /> is Havoc's primary personal defensive. Using it well helps
        you survive dangerous moments more reliably and reduces avoidable pressure on your healers.
      </p>
      <p>
        Because Blur has a relatively short cooldown, it should usually be used proactively for
        meaningful incoming damage rather than held too long waiting for a perfect emergency.
      </p>
      <p>When reviewing your Blur usage, focus on two questions:</p>
      <ol>
        <li>
          Did Blur cover dangerous spikes or other high-pressure damage windows?
          <p>
            <small>
              In the damage chart below, a spike highlighted in{' '}
              <Highlight color={GoodColor} textColor="black">
                green
              </Highlight>{' '}
              was covered by Blur.
            </small>
          </p>
        </li>
        <li>
          Was Blur used often enough across the fight, or was it held long enough to lose value?
          <p>
            <small>
              The cooldown timeline below shows whether casts were timed around threatening damage
              and whether long gaps may have cost you additional uses.
            </small>
          </p>
        </li>
      </ol>
      <SubSection title="Damage Taken">
        <Timeline analyzers={defensiveAnalyzers} />
      </SubSection>
      <AllCooldownUsageList analyzers={defensiveAnalyzers} />
    </Section>
  );
}
