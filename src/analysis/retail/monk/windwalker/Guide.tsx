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

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">
        <MasteryGraph modules={modules} events={events} info={info} />
        {modules.risingSunKick.guideSubsection}
        {modules.fistsofFury.guideSubsection}
        {modules.strikeoftheWindlord.guideSubsection}
      </Section>
      <Section title="Major cooldowns">
        {modules.invokeXuen.guideSubsection}
        {modules.serenity.guideSubsection}
      </Section>
      <Section title="Core Rotation">
        The current iteration of Windwalker forces multiple different playstyles based on talents
        chosen, and whether you are inside or outside of a{' '}
        <SpellLink spell={TALENTS_MONK.SERENITY_TALENT} /> window.
        {info.combatant.hasTalent(TALENTS_MONK.SERENITY_TALENT) && (
          <SubSection title="During Serenity">
            <AplSectionData checker={AplCheck.checkSerenity} apl={AplCheck.serenityApl} />
          </SubSection>
        )}
        <SubSection title="Outside of Serenity">
          <AplSectionData checker={AplCheck.checkNonSerenity} apl={AplCheck.nonSerenityApl} />
        </SubSection>
      </Section>
      <Section title="Other cooldowns, buffs and procs">
        {modules.chiBurst.guideSubsection}
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
