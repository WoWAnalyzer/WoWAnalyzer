import { formatPercentage } from 'common/format';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { ResourceLink } from 'interface';
import PerformanceStrong from 'interface/PerformanceStrong';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import CombatLogParser from '../CombatLogParser';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import FuryCapWaste from 'analysis/retail/demonhunter/shared/guide/FuryCapWaste';
import {
  GOOD_TIME_AT_FURY_CAP,
  OK_TIME_AT_FURY_CAP,
  PERFECT_TIME_AT_FURY_CAP,
} from '../modules/resourcetracker/FuryTracker';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

function CoreSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core">
      <SubSection title="Rotation Priority">
        <p>
          Devourer is a priority-based spec. Outside{' '}
          <SpellLink spell={SPELLS.VOID_METAMORPHOSIS_BUFF} />, you want to build toward Meta and
          only cast <SpellLink spell={SPELLS.REAP} /> once you have a strong pre-Meta window —
          typically around 84 Fury or on a <SpellLink spell={SPELLS.MOMENT_OF_CRAVING_BUFF} /> proc.
          {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOIDBLADE_TALENT) ||
          info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT) ? (
            <>
              Use <SpellLink spell={TALENTS_DEMON_HUNTER.VOIDBLADE_TALENT} /> or{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.THE_HUNT_DEVOURER_TALENT} /> if you are about
              to enter Meta.
            </>
          ) : (
            ' '
          )}
        </p>
        <p>
          Inside Meta, <SpellLink spell={TALENTS_DEMON_HUNTER.VOID_RAY_TALENT} /> is the highest
          priority.
          {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOIDSURGE_TALENT) ? (
            <>
              {' '}
              Follow it with melee spells that proc{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.VOIDSURGE_TALENT} /> and use{' '}
            </>
          ) : (
            ' '
          )}
          <SpellLink spell={SPELLS.CULL} /> at 4+ Soul Fragments or to avoid overcapping charges,
          then keep casting <SpellLink spell={SPELLS.DEVOUR} />.
        </p>
      </SubSection>

      <SubSection title="Fury">
        <p>
          Devourer's primary resource is <ResourceLink id={RESOURCE_TYPES.FURY.id} />. You should
          avoid capping <ResourceLink id={RESOURCE_TYPES.FURY.id} /> because lost fury is lost DPS.
        </p>
        <FuryCapWaste
          percentAtCap={modules.furyTracker.percentAtCap}
          percentAtCapPerformance={modules.furyTracker.percentAtCapPerformance}
          perfectTimeAtFuryCap={PERFECT_TIME_AT_FURY_CAP}
          goodTimeAtFuryCap={GOOD_TIME_AT_FURY_CAP}
          okTimeAtFuryCap={OK_TIME_AT_FURY_CAP}
          wasted={modules.furyTracker.wasted}
        />
        {modules.furyGraph.plot}
      </SubSection>

      <SubSection title="Soul Fragments">
        <p>
          Most of your damage comes from managing <SpellLink spell={SPELLS.SOUL_FRAGMENT_DEVOUR} />{' '}
          generation and spending it cleanly. Avoid overcapping Soul Fragments and aim to spend them
          before entering <SpellLink spell={SPELLS.VOID_METAMORPHOSIS_BUFF} />.
        </p>
        {modules.soulFragmentsGraph.plot}
      </SubSection>

      <SubSection title="Active Time">
        <p>
          <b>
            Continuously casting throughout an encounter is the single most important thing for
            achieving good DPS.
          </b>
          <div>
            Some fights have unavoidable downtime due to phase transitions and the like, so in these
            cases 0% downtime will not be possible - do the best you can.
          </div>
        </p>
        <p>
          Remember that you always have access to either <SpellLink spell={SPELLS.CONSUME} /> or{' '}
          <SpellLink spell={SPELLS.DEVOUR} /> and that they can be cast while moving.
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

      {modules.reap.guideSubsection()}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT) &&
        modules.cull.guideSubsection()}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_RAY_TALENT) &&
        modules.voidRay.guideSubsection()}
    </Section>
  );
}

export default CoreSection;
