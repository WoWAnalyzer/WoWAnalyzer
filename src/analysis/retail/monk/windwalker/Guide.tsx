import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from './CombatLogParser';
import * as AplCheck from './modules/apl/AplCheck';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">
        <MasteryGraph modules={modules} events={events} info={info} />
        {modules.risingSunKick.guideSubsection}
        {modules.fistsofFury.guideSubsection}
        {modules.strikeoftheWindlord.guideSubsection}
      </Section>
      <Section title="Major cooldowns">{modules.invokeXuen.guideSubsection}</Section>
      <Section title="Core Rotation">
        <SubSection title="Overview">
          The priority list provided here is a rough outline of actions taken, however as always you
          must ensure not to break mastery by repeating the same spell twice. As such inter-weaving{' '}
          <SpellLink spell={SPELLS.TIGER_PALM} /> and <SpellLink spell={SPELLS.BLACKOUT_KICK} />{' '}
          appropritely to ensure not over-capping or starving either{' '}
          <SpellLink spell={RESOURCE_TYPES.ENERGY} /> or <SpellLink spell={RESOURCE_TYPES.CHI} />.
          <br />
          <br />
          More (and most up to date) information on the APL can be found{' '}
          <a href="https://www.peakofserenity.com/tww/windwalker/pve-guide/#Priority_Lists">
            on Peak of Serenity{' '}
          </a>
          which includes a more in-depth overview of precisely how to play Windwalker in Single
          Target.
          <br />
        </SubSection>
        <SubSection title="APL Analysis">
          <AplSectionData checker={AplCheck.checkApl} apl={AplCheck.apl} />
        </SubSection>
      </Section>
      <Section title="Other cooldowns, buffs and procs">
        {info.combatant.hasTalent(TALENTS_MONK.CHI_BURST_SHARED_TALENT) &&
          modules.chiBurst.guideSubsection}
        {modules.comboBreaker.guideSubsection}
        {modules.touchOfKarma.guideSubsection}
      </Section>
      <PreparationSection />
    </>
  );
}

function MasteryGraph({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const styleObj = {
    fontSize: 20,
  };
  const explanation = (
    <>
      <p>
        <b>
          <SpellLink spell={SPELLS.COMBO_STRIKES} />
        </b>{' '}
        is an extremely important part of playing Windwalker effectively. Dropping stacks of your
        mastery is particularly dangerous when also running{' '}
        <SpellLink spell={TALENTS_MONK.HIT_COMBO_TALENT} /> as it causes the mastery drop to double
        dip.
        {info.combatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT) && (
          <>
            <br />
            <br />
            The graph visualizes all drops, and the time it takes to get back to the full effect.
          </>
        )}
      </p>
    </>
  );

  const data = (
    <div>
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.COMBO_STRIKES} /> maintenance
          </strong>
          <div style={styleObj}>{modules.comboStrikes.subStatistic}</div>
          {info.combatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT) && (
            <>
              <strong>
                <SpellLink spell={SPELLS.HIT_COMBO_BUFF} /> maintenance
              </strong>
              {modules.hitComboGraph.plot}
            </>
          )}
        </RoundedPanel>
      </div>
    </div>
  );

  return <SubSection>{explanationAndDataSubsection(explanation, data)}</SubSection>;
}
