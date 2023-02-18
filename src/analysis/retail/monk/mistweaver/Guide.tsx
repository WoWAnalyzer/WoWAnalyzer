import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon, SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import SPELLS from 'common/SPELLS';
import CombatLogParser from '../mistweaver/CombatLogParser';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells">
        {modules.renewingMist.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.RISING_SUN_KICK_TALENT) &&
          modules.risingSunKick.guideSubsection}
        {modules.thunderFocusTea.guideSubsection}
        {modules.vivify.guideSubsection}
        {modules.essenceFont.guideSubsection}
        <RemGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Short cooldowns, buffs, and procs">
        {info.combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT) &&
          modules.chiBurst.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT) &&
          modules.vivaciousVivification.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT) &&
          modules.ancientTeachingsoftheMonastery.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT) && (
          <SheilunsGraph modules={modules} events={events} info={info} />
        )}
        {info.combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT) &&
          modules.manaTea.guideCastBreakdown}
      </Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
        {info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
          ? modules.invokeChiJi.guideCastBreakdown
          : modules.invokeYulon.guideCastBreakdown}
        {modules.revival.guideCastBreakdown}
        <HotGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <PreparationSection />
    </>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>HoT Graph</strong> - This graph shows the number of non-Renewing Mist HoTs you had
      active over the course of the encounter. It can help you evaluate how effective you were at
      prepping and executing your cooldowns. Having several{' '}
      <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id} /> out before casting{' '}
      <SpellLink id={modules.revival.getRevivalTalent()} /> or{' '}
      <SpellLink id={modules.invokeChiJi.getCelestialTalent()} /> will drastically increase their
      effectiveness, and the number of <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} />{' '}
      that go out during <SpellLink id={modules.invokeChiJi.getCelestialTalent()} /> directly
      correlates to your hps during.
      {modules.hotCountGraph.plot}
    </SubSection>
  );
}

function RemGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>
        <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> Graph
      </strong>{' '}
      - this graph shows how many <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> you have over
      the course of the fight in relation to your{' '}
      <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} /> and <SpellLink id={SPELLS.VIVIFY} />{' '}
      casts.
      {modules.remGraph.plot}
    </SubSection>
  );
}

function SheilunsGraph({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const styleObj = {
    fontSize: 20,
  };
  const styleObjInner = {
    fontSize: 15,
  };
  const explanation = (
    <>
      <p>
        <b>
          <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT.id} />
        </b>{' '}
        is a potent AoE spot heal and grants extremely strong throughput buffs when talented into{' '}
        <SpellLink id={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />. If talented into{' '}
        <SpellLink id={TALENTS_MONK.VEIL_OF_PRIDE_TALENT} />, then try to cast{' '}
        <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> as a powerful spot heal when you have
        at least 4 stacks, while trying to avoid excessive overhealing. If talented into{' '}
        <SpellLink id={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />, aim to cast{' '}
        <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> before spamming{' '}
        <SpellLink id={SPELLS.VIVIFY} /> during a{' '}
        <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> peak (8-10+ active HoTs) or before
        casting{' '}
        {info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) ? (
          <SpellLink id={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />
        ) : (
          <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
        )}
        . You can cast <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> with as little as 1
        stack before casting <SpellLink id={TALENTS_MONK.REVIVAL_TALENT} /> in order to try to fish
        for <SpellLink id={SPELLS.LESSON_OF_DOUBT_BUFF} /> to gain a significant healing boost to
        one of your major raid cooldowns.
      </p>
    </>
  );

  const data = (
    <div>
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> cloud efficiency
          </strong>
          {modules.sheilunsGiftCloudGraph.plot}
        </RoundedPanel>
      </div>
      <br />
      <RoundedPanel>
        <div style={styleObj}>
          <SpellIcon id={TALENTS_MONK.SHEILUNS_GIFT_TALENT} style={{ height: '28px' }} />{' '}
          <b>{modules.sheilunsGift.cloudsLost}</b>{' '}
          <small style={styleObjInner}>clouds wasted</small>
        </div>
      </RoundedPanel>
    </div>
  );

  return (
    <SubSection>
      {explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT)}
    </SubSection>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const invokeId = info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
    ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id
    : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id;
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={invokeId}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spellId={TALENTS_MONK.REVIVAL_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      {info.combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT) && (
        <CastEfficiencyBar
          spellId={TALENTS_MONK.MANA_TEA_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
