import { GuideProps, Section, SubSection } from 'interface/guide';
import { TALENTS_EVOKER, TALENTS_WARRIOR } from 'common/TALENTS';
import CombatLogParser from '../../CombatLogParser';
import { SpellLink } from 'interface';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import HideGoodCastsToggle from 'interface/guide/components/HideGoodCastsToggle';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';

export function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation">
      <p>
        Augmentation evoker has something something{' '}
        <SpellLink spell={TALENTS_EVOKER.EBON_MIGHT_TALENT} /> something something about the thing
        with the <SpellLink spell={TALENTS_EVOKER.PRESCIENCE_TALENT} /> . Can't forget about{' '}
        <SpellLink spell={TALENTS_EVOKER.BREATH_OF_EONS_TALENT} />. Something about the special
        thing. Something about <SpellLink spell={TALENTS_EVOKER.BLISTERING_SCALES_TALENT} />. Can't
        forget about <SpellLink spell={TALENTS_EVOKER.TIME_SKIP_TALENT} />
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

      {modules.sandsOfTime.guideSubsection()}
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
          provides a 30% armor buff. <br />
          There is essentially two ways to play with it, either upkeep on actively tanking tank.{' '}
          <br />
          Or place it on a Warrior for the damage amp the extra armor provides them through the
          talent <SpellLink spell={TALENTS_WARRIOR.ARMORED_TO_THE_TEETH_SHARED_TALENT} />
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
