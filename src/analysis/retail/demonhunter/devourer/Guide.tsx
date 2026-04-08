import { GuideProps, Section } from 'interface/guide';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CoreSection from './guide/CoreSection';
import ProcsAndBuffsSection from './guide/ProcsAndBuffsSection';
import DefensivesSection from './modules/majordefensives/DefensivesGuideSection';
import CooldownSection from './guide/CooldownSection';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';

export const GUIDE_CORE_EXPLANATION_PERCENT = 50;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <DisclaimerSection />
      <CoreSection modules={modules} events={events} info={info} />
      <ProcsAndBuffsSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <DefensivesSection />
      <PreparationSection />
    </>
  );
}

const DisclaimerSection = () => {
  return (
    <Section title="Disclaimer">
      Due to current bugs with <SpellLink spell={SPELLS.REAP} />, <SpellLink spell={SPELLS.CULL} />{' '}
      and <SpellLink spell={SPELLS.ERADICATE} /> logging, related analysis is NOT working and should
      be ignored. Because those were core to the gameplay of the spec, this represents a significant
      part of this page.
    </Section>
  );
};
