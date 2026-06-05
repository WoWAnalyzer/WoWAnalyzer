import { GuideProps, Section } from 'interface/guide';
import TALENTS from 'common/TALENTS/shaman';
import CombatLogParser from './CombatLogParser';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import MaelstromUsage from './modules/guide/MaelstromUsage';
import Cooldowns from './modules/guide/Cooldowns';
import DefensiveAndUtility from '../shared/guide/DefensiveAndUtility';
import { Seriousnes } from 'CONTRIBUTORS';
import Contributor from 'interface/ContributorButton';
import FoundationDowntimeSectionV2 from 'interface/guide/foundation/FoundationDowntimeSectionV2';

export default function Guide(props: GuideProps<typeof CombatLogParser>) {
  const combatant = props.info.combatant;
  const isTotemic = combatant.hasTalent(TALENTS.SURGING_TOTEM_TALENT);
  const isStormbringer = combatant.hasTalent(TALENTS.TEMPEST_TALENT);

  return (
    <>
      <Section title="Preface & Disclaimers">
        <>
          <p>
            The analysis in this guide is provided by <Contributor {...Seriousnes} /> in
            collaboration with the members and staff of the{' '}
            <a href="https://discord.gg/earthshrine">Earthshrine</a> Shaman discord. When reviewing
            this information, keep in mind that WoWAnalyzer is limited to the information that is
            present in your combat log. As a result, we have no way of knowing if you were
            intentionally doing something suboptimal because the fight or strat required it (such as
            Forced Downtime or holding cooldowns for a burn phase). Because of this, we recommend
            comparing your analysis against a top 100 log for the same boss.
          </p>
          <p>
            For additional assistance in improving your gameplay, or to have someone look more in
            depth at your combat logs, please visit the{' '}
            <a href="https://discord.gg/earthshrine">Earthshrine</a> discord.
          </p>
          <p>
            If you notice any issues or errors in this analysis or if there is additional analysis
            you would like added, please ping <code>@Seriousnes</code> in the{' '}
            <a href="https://discord.gg/earthshrine">Earthshrine</a> discord.
          </p>
        </>
      </Section>
      <Section title="Hero Talent">
        {isTotemic && props.modules.surgingTotem.guideSubsection}
        {isStormbringer && props.modules.tempest.guideSubsection}
      </Section>
      <Cooldowns {...props} />
      <Section title="Always Be Casting">
        <FoundationDowntimeSectionV2 />
      </Section>
      <MaelstromUsage {...props} />
      <DefensiveAndUtility />
      <PreparationSection />
    </>
  );
}
