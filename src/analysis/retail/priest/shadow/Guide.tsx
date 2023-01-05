import { GuideProps, Section, SubSection } from 'interface/guide';
import { t, Trans } from '@lingui/macro';
import { PerformanceStrong } from 'analysis/retail/demonhunter/shared/guide/ExtraComponents';
import { formatPercentage } from 'common/format';

import talents from 'common/TALENTS/priest';
//import spells from 'common/SPELLS/priest';
import CombatLogParser from './CombatLogParser';
//import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
//import { SpellLink } from 'interface';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import CooldownGraphSubsection from './modules/guide/CooldownGraphSubsection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core">
        <ResourceUsageSection modules={modules} events={events} info={info} />
        {modules.dotUptimes.guideSubsectionDP}
        {modules.dotUptimes.guideSubsection}
        {/* This information does not alter the rotation, maybe should be taken out.
          {info.combatant.hasTalent(talents.DARK_EVANGELISM_TALENT) && (
            <SubSection title="Dark Evangelism">{modules.dotUptimes.guideSubsectionDE}</SubSection>
          )}  
        */}
        <CooldownGraphSubsection.CoreCooldownsGraph />
      </Section>

      <Section title="Cooldowns">
        <CooldownGraphSubsection.ShortCooldownsGraph />
        <CooldownGraphSubsection.LongCooldownsGraph />
        <CooldownGraphSubsection.CoreCooldownsGraph />
      </Section>

      <Section title="Proc Usage">
        {info.combatant.hasTalent(talents.SHADOWY_INSIGHT_TALENT) &&
          modules.shadowyInsight.guideSubsection}
        {info.combatant.hasTalent(talents.MIND_DEVOURER_TALENT) &&
          modules.mindDevourer.guideSubsection}
        {info.combatant.hasTalent(talents.MIND_FLAY_INSANITY_TALENT) &&
          modules.mindFlayInsanity.guideSubsection}
        {info.combatant.hasTalent(talents.SURGE_OF_DARKNESS_TALENT) &&
          modules.surgeOfDarkness.guideSubsection}
        {info.combatant.hasTalent(talents.UNFURLING_DARKNESS_TALENT) &&
          modules.unfurlingDarkness.guideSubsection}
        {info.combatant.hasTalent(talents.DEATHSPEAKER_TALENT) &&
          modules.deathspeaker.guideSubsection}
      </Section>

      <Section title="Action Priority List">
        <p>
          {' '}
          <SubSection>Coming Soon!</SubSection>{' '}
        </p>
      </Section>

      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ modules }: GuideProps<typeof CombatLogParser>) {
  const InsanityWasted = modules.insanityUsage.wasted;
  const InsanityWastedPercent = modules.insanityUsage.wastePercentage;
  const InsanityWastedPercentFormatted = formatPercentage(InsanityWastedPercent, 1);
  const InsanityWastedPerformance = modules.insanityTracker.WastedInsanityPerformance;

  return (
    <Section
      title={t({
        id: 'guide.priest.shadow.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.priest.shadow.sections.resources.insanity.title',
          message: 'Insanity',
        })}
      >
        <p>
          <Trans id="guide.priest.shadow.sections.resources.insanity.summary">
            Shadow's primary resource is Insanity. You should avoid capping insanity.
          </Trans>
        </p>
        <p>
          <Trans id="guide.priest.shadow.sections.resources.insanity.chart">
            The chart below shows your Insanity over the course of the encounter. You wasted{' '}
            <PerformanceStrong performance={InsanityWastedPerformance}>
              {InsanityWasted} ({InsanityWastedPercentFormatted}%)
            </PerformanceStrong>{' '}
            of your Insanity.
          </Trans>
        </p>
        {/*modules.insanityGraph.plot*/}
      </SubSection>
    </Section>
  );
}
