import { GuideProps, Section } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';

export function Helpers({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Helper Modules">
      <p>
        Determining the optimal targets for your buffs, such as{' '}
        <SpellLink spell={SPELLS.PRESCIENCE_BUFF} /> or{' '}
        <SpellLink spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} />, can be a challenging task. The
        modules below are designed to assist you in making these decisions, as well as provide
        in-depth analysis for spells like <SpellLink spell={TALENTS_EVOKER.BREATH_OF_EONS_TALENT} />
        .
      </p>
      <p>
        <strong>
          Please note that all these modules are loaded on demand and will not offer any analysis
          until you click the <span className="clickToLoad">Click to load</span> buttons.
        </strong>
      </p>
      {modules.buffTargetHelper.guideSubsection()}
      {modules.breathOfEonsRotational.helperSection()}
    </Section>
  );
}
