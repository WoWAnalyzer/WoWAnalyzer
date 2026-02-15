import { GuideProps, Section } from 'interface/guide';
import TALENTS from 'common/TALENTS/shaman';
import CombatLogParser from '../CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import Cooldowns, {
  ElementalCooldownGraphs,
} from 'analysis/retail/shaman/elemental/guide/Cooldowns';
import DefensiveAndUtility from '../../shared/guide/DefensiveAndUtility';

const PrefaceSection = () => {
  return (
    <Section title="Preface">
      <p>
        Hi, and welcome to the Elemental shaman WowAnalyzer page. The information on this page is
        mostly on how you can improve your DPS, however you must not put yourself in high risk of
        dying to do so. Always ensure you do appropriate mechanics correctly first, then focus on
        DPS as #2.
      </p>
      <p>
        The performance indicated here are <strong className="ok-mark">guidelines</strong>, and will
        vary from fight to fight and pull to pull. You should use the information here as a
        foundation for your own analysis.
      </p>
      <p>
        If you have any questions on the spec, rotation or this guide in general, you can find us in
        the <code>#elemental</code> channel in the{' '}
        <a href="https://discord.gg/earthshrine">Earthshrine Discord server</a>.
      </p>
    </Section>
  );
};

const ResourcesSection = (props: GuideProps<typeof CombatLogParser>) => {
  const { modules } = props;
  return (
    <Section title="Resource usage">
      {modules.maelstromDetails.guideSubsection}
      {modules.alwaysBeCasting.guideSubsection}
    </Section>
  );
};

/** A section for the core combo, abilities and buffs. */
const CoreSection = (props: GuideProps<typeof CombatLogParser>) => {
  const { info, modules } = props;
  return (
    <>
      {info.combatant.hasTalent(TALENTS.CALL_OF_THE_ANCESTORS_TALENT) &&
        modules.callOfTheAncestors.guideSubsection}
      {modules.maelstromSpenders.guideSubsection}
      {modules.flameShock.guideSubsection}
    </>
  );
};

/**
 */

/** The guide for Elemental Shamans. */
export default function ElementalGuide(props: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <PrefaceSection />
      <Section title="Guide">
        <Cooldowns {...props} />
        <CoreSection {...props} />
        <ElementalCooldownGraphs />
      </Section>
      <ResourcesSection {...props} />
      <DefensiveAndUtility />
      <PreparationSection />
    </>
  );
}
