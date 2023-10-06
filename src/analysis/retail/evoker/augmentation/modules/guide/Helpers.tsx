import { GuideProps, Section } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';

export function Helpers({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Helper Modules">
      <p>
        Augmentations core rotation revolves around proper upkeep of your buffs:{' '}
        <SpellLink spell={TALENTS_EVOKER.EBON_MIGHT_TALENT} />,{' '}
        <SpellLink spell={TALENTS_EVOKER.PRESCIENCE_TALENT} />,{' '}
        <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} />, and{' '}
        <SpellLink spell={TALENTS_EVOKER.BLISTERING_SCALES_TALENT} />. While using your empowers:{' '}
        <SpellLink spell={SPELLS.FIRE_BREATH} /> and <SpellLink spell={SPELLS.UPHEAVAL} /> on
        cooldown, along with spending essence on{' '}
        <SpellLink spell={TALENTS_EVOKER.ERUPTION_TALENT} />; using{' '}
        <SpellLink spell={SPELLS.LIVING_FLAME_CAST} /> to fill in the gaps.
        <br />
        Your main cooldown, <SpellLink spell={TALENTS_EVOKER.BREATH_OF_EONS_TALENT} />, should be
        used alongside your other DPS players' major cooldowns, since it amplifies their damage.
        Using <SpellLink spell={TALENTS_EVOKER.TIME_SKIP_TALENT} /> on every other{' '}
        <SpellLink spell={TALENTS_EVOKER.BREATH_OF_EONS_TALENT} /> to further amplify the burst
        window.
      </p>

      {modules.buffTargetHelper.guideSubsection()}

      {modules.breathOfEonsRotational.helperSection()}
    </Section>
  );
}
