import { GuideProps, Section, SubSection } from 'interface/guide';
import { TALENTS_EVOKER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import HideGoodCastsToggle from 'interface/guide/components/HideGoodCastsToggle';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';

export function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation">
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

      <HideExplanationsToggle id="hide-explanations-rotations" />
      <HideGoodCastsToggle id="hide-good-casts-rotations" />

      <SubSection title="Buff Graph">
        This graph shows how many Ebon Mights and Presciences you had active over the course of the
        encounter, with rule lines showing when you used Breath of Eon. Use this to ensure that you
        are properly upkeeping your buffs.
        {modules.buffTrackerGraph.plot}
      </SubSection>

      <BlisteringScalesSection modules={modules} events={events} info={info} />

      {modules.ebonMight.guideSubsection()}

      <SubSection>
        <CooldownUsage analyzer={modules.prescience} title="Prescience" />
      </SubSection>

      {modules.sandsOfTime.guideSubsection()}

      {modules.shiftingSands.guideSubsection()}
    </Section>
  );
}

function BlisteringScalesSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection title="Blistering Scales">
      <ExplanationRow>
        <Explanation>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.BLISTERING_SCALES_TALENT} />
          </strong>{' '}
          provides your target with 30% of your armor. <br />
          This should be kept up on the currently actively tanking player.
          <br />
          You can also use it as a powerful external with the talent{' '}
          <SpellLink spell={TALENTS_EVOKER.MOLTEN_BLOOD_TALENT} />.
        </Explanation>
        <RoundedPanel>
          <p>
            <strong>
              <SpellLink spell={TALENTS_EVOKER.BLISTERING_SCALES_TALENT} />
            </strong>{' '}
            uptime
          </p>
          {modules.blisteringScalesGraph.plot}
        </RoundedPanel>
      </ExplanationRow>
    </SubSection>
  );
}
