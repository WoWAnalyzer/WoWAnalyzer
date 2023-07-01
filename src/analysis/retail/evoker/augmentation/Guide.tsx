import CombatLogParser from './CombatLogParser';
import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { CooldownSection } from './modules/guide/Cooldown';
import { IntroSection } from './modules/guide/IntroSection';

import HideGoodCastsToggle from 'interface/guide/components/HideGoodCastsToggle';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import { t } from '@lingui/macro';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <IntroSection />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} info={info} events={events} />
      <PreparationSection />
    </>
  );
}

function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.evoker.augmentation.sections.coreRotation.title',
        message: 'Core Rotation',
      })}
    >
      <p>
        Augmentation evoker has something something <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} />{' '}
        something something about the thing with the <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />{' '}
        . Can't forget about <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} />. Something about
        the special thing. Something about <SpellLink spell={TALENTS.BLISTERING_SCALES_TALENT} />.
        Can't forget about <SpellLink spell={TALENTS.TIME_SKIP_TALENT} />
      </p>
      <HideExplanationsToggle id="hide-explanations-rotations" />
      <HideGoodCastsToggle id="hide-good-casts-rotations" />
      <BuffGraphSection modules={modules} events={events} info={info} />
      {modules.sandsOfTime.guideSubsection()}
    </Section>
  );
}

function BuffGraphSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Buff Graph</strong> - this graph shows how many Ebon Mights and Presciences you had
      active over the course of the encounter, with rule lines showing when you used Breath of Eon.
      Use this to ensure that you are properly upkeeping your buffs.
      {modules.buffTrackerGraph.plot}
    </SubSection>
  );
}
