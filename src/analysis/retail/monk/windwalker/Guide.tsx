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
import windwalkerApl from './modules/apl/WindwalkerApl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">
        <MasteryGraph modules={modules} events={events} info={info} />
        {info.combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT) &&
          modules.heartOfTheJadeSerpent.guideSubsection(modules.celestialConduit.clipAnalysis)}
        {modules.risingSunKick.guideSubsection}
        {modules.fistsofFury.guideSubsection}
        {modules.strikeoftheWindlord.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.SLICING_WINDS_TALENT) &&
          modules.slicingWinds.guideSubsection}
      </Section>
      <Section title="Major cooldowns">{modules.invokeXuen.guideSubsection}</Section>
      <Section title="Core Rotation">
        <SubSection title="Overview">
          <p>
            Windwalker is not played by mindlessly following the next line of the APL. The core of
            the spec is maintaining <SpellLink spell={SPELLS.COMBO_STRIKES} />, avoiding repeated
            casts, and weaving <SpellLink spell={SPELLS.TIGER_PALM} /> and{' '}
            <SpellLink spell={SPELLS.BLACKOUT_KICK} /> so you do not over-cap{' '}
            <SpellLink spell={RESOURCE_TYPES.ENERGY} /> or get stranded without enough{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> for your important spenders.
          </p>
          <p>
            In practice, most of your rotational decisions are about feeding high-value buttons
            cleanly. <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} />,{' '}
            <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />,{' '}
            <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} />,{' '}
            <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} />, and hero-specific
            payoffs should be given room in the next few globals. That means using{' '}
            <SpellLink spell={SPELLS.TIGER_PALM} /> proactively when you need chi for an upcoming
            spender, but minimizing extra <SpellLink spell={SPELLS.TIGER_PALM} /> casts inside burst
            windows where stronger abilities are available.
          </p>
          <p>
            Procs matter as much as cooldown order. Spend{' '}
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> before it expires, use{' '}
            <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> without overcapping it, and avoid
            sitting on high-impact cooldowns for filler globals. The APL should be read as your
            ordered tiebreaker once mastery, resource flow, and proc management are already being
            respected.
          </p>
          <p>
            Your major cooldown windows should be built around{' '}
            <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} />. Going into that
            window, pool enough resources that you can immediately spend globals on your strongest
            abilities instead of fixing chi with multiple <SpellLink spell={SPELLS.TIGER_PALM} />{' '}
            casts. Peak of Serenity currently recommends keeping one charge of{' '}
            <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} /> ready for your{' '}
            <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> and{' '}
            <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT} /> burst, and
            delaying <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> or{' '}
            <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} /> briefly if needed so those
            globals land inside your cooldown package.
          </p>
          <p>
            When playing around <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} />, the goal is not
            simply to press it on cooldown. Use it with your burst tools, front-load stat buffs and
            trinkets before activating it, and avoid wasting the window on low-value setup globals.
            This is especially important with{' '}
            <SpellLink spell={TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT} />
            , where reducing <SpellLink spell={SPELLS.TIGER_PALM} /> usage inside Zenith is part of
            correct play rather than a minor optimization.
          </p>
          <p>
            More complete and up-to-date rotation guidance is available in the{' '}
            <a href="https://www.peakofserenity.com/tww/windwalker/pve-guide/#Priority_Lists">
              Peak of Serenity Windwalker guide
            </a>
            .
          </p>
        </SubSection>
        <SubSection title="APL Analysis">
          <AplSectionData checker={AplCheck.check} apl={windwalkerApl(info)} />
        </SubSection>
      </Section>
      <Section title="Other cooldowns, buffs and procs">
        {info.combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT) &&
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
