import { Section, GuideProps, SubSection } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import Explanation from 'interface/guide/components/Explanation';
import PerformanceStrong from 'interface/PerformanceStrong';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const alwaysBeCastingSubsection = (
    <SubSection title="Active Time">
      <Explanation>
        <b>The First Rule of SpellCasters: Always Be Casting.</b>
        <p>
          Minimizing downtime is one of the best ways to increase your DPS. As a mage, using
          abilities like <SpellLink spell={TALENTS.ICE_FLOES_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.SHIMMER_TALENT} /> can minimize downtime caused by movement.
          Additionally, instant spells such as <SpellLink spell={TALENTS.FLURRY_TALENT} />,{' '}
          <SpellLink spell={TALENTS.ICE_LANCE_TALENT} /> (With{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> or{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />
          ), and <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> are good ways to reposition or
          inch towards somewhere you need to be without losing any uptime. If nothing else is
          available, casting <SpellLink spell={TALENTS.ICE_LANCE_TALENT} /> without any procs is
          better than casting nothing at all.
        </p>
        <p>
          Downtime from forced downtime such as phase transitions and immune phases are unavoidable,
          but you can sometimes use reduced damage phases to fish for procs to spend after the phase
          ends. We recommend comparing your Active Time against a top parse for the same
          boss/difficulty with a similar kill time since the max possible Active Time will vary
          wildly based on spec, boss, difficulty, etc.
        </p>
      </Explanation>
      <p>
        Active Time:{' '}
        <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
          {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
        </PerformanceStrong>{' '}
        Cancelled Casts:{' '}
        <PerformanceStrong performance={modules.cancelledCasts.CancelledPerformance}>
          {formatPercentage(modules.cancelledCasts.cancelledPercentage, 1)}%
        </PerformanceStrong>{' '}
      </p>
      <ActiveTimeGraph
        activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
        fightStart={info.fightStart}
        fightEnd={info.fightEnd}
      />
    </SubSection>
  );

  return (
    <>
      <Section title="Core">
        {modules.wintersChill.guideSubsection}
        {modules.flurry.guideSubsection}
        {info.combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT) &&
          modules.glacialSpike.guideSubsection}
        {alwaysBeCastingSubsection}
      </Section>
      <Section title="Procs">
        {info.combatant.hasTalent(TALENTS.BRAIN_FREEZE_TALENT) &&
          modules.brainFreeze.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FINGERS_OF_FROST_TALENT) &&
          modules.fingersOfFrost.guideSubsection}
      </Section>
      <Section title="Cooldowns">
        {modules.icyVeins.guideSubsection}
        {info.combatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT) &&
          modules.rayOfFrost.guideSubsection}
        {info.combatant.hasTalent(TALENTS.COMET_STORM_TALENT) && modules.cometStorm.guideSubsection}
        {info.combatant.hasTalent(TALENTS.FROZEN_ORB_TALENT) && modules.frozenOrb.guideSubsection}
        {info.combatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT) &&
          modules.shiftingPowerFrost.guideSubsection}
      </Section>
      <PreparationSection />
    </>
  );
}
