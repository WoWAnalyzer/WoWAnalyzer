import { GuideProps, Section, SubSection } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import { ResourceLink, SpellLink } from 'interface';
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

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
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
      <CooldownUsage analyzer={modules.essenceBreak} title="Essence Break" />
      <CooldownUsage analyzer={modules.eyeBeam} title="Eye Beam" />
      {info.combatant.hasTalent(TALENTS.SIGIL_OF_SPITE_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink spell={TALENTS.SIGIL_OF_SPITE_TALENT} /> coming soon!
          </div>,
          <></>,
        )}
      {info.combatant.hasTalent(TALENTS.GLAIVE_TEMPEST_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink spell={TALENTS.GLAIVE_TEMPEST_TALENT} /> coming soon!
          </div>,
          <></>,
        )}
      {info.combatant.hasTalent(TALENTS.FEL_BARRAGE_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink spell={TALENTS.FEL_BARRAGE_TALENT} /> coming soon!
          </div>,
          <></>,
        )}
    </Section>
  );
}

function RotationSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <HideExplanationsToggle id="hide-explanations-rotations" />
      <HideGoodCastsToggle id="hide-good-casts-rotations" />
      {modules.throwGlaive.guideSubsection()}
      {modules.momentum.guideSubsection()}
      {modules.unboundChaos.guideSubsection()}
    </Section>
  );
}
