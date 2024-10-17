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
import * as AplCheck from './modules/core/apl/AplCheck';
import AplChoiceDescription from './modules/core/apl/AplChoiceDescription';
import { AplSectionData } from 'interface/guide/components/Apl';
import { defaultExplainers } from 'interface/guide/components/Apl/violations/claims';
import { filterCelestial } from './modules/core/apl/ExplainCelestial';

const explainers = {
  overcast: filterCelestial(defaultExplainers.overcastFillers),
  dropped: filterCelestial(defaultExplainers.droppedRule),
};
/** Common 'rule line' point for the explanation/data in Core Spells section */
export const GUIDE_CORE_EXPLANATION_PERCENT = 40;

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <Section title="Core Spells and Buffs">
        {modules.renewingMist.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT) &&
          modules.risingSunKick.guideSubsection}
        {modules.thunderFocusTea.guideSubsection}
        {modules.vivify.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT) &&
          modules.ancientTeachings.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT) && (
          <SheilunsGraph modules={modules} events={events} info={info} />
        )}
        {info.combatant.hasTalent(TALENTS_MONK.ASPECT_OF_HARMONY_TALENT) &&
          modules.aspectOfHarmony.guideSubsection}
        <RemGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Healing Cooldowns">
        <CooldownGraphSubsection modules={modules} events={events} info={info} />
        {info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
          ? modules.invokeChiJi.guideCastBreakdown
          : modules.invokeYulon.guideCastBreakdown}
        {(info.combatant.hasTalent(TALENTS_MONK.SHAOHAOS_LESSONS_TALENT) ||
          info.combatant.hasTalent(TALENTS_MONK.JADE_BOND_TALENT)) &&
          modules.revival.guideCastBreakdown}
        {info.combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_TALENT) &&
          modules.celestialConduit.guideCastBreakdown}
        {/* {info.combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT) &&
          modules.manaTea.guideCastBreakdown} */}
        <HotGraphSubsection modules={modules} events={events} info={info} />
      </Section>
      <Section title="Core Rotation">
        <p>
          Healers do not have a static rotation, but Mistweaver gameplay is still driven by a
          priority list that is valid in the majority of situations. When using an ability, aim to
          use the abilities that are highest on the list.
        </p>
        <AplChoiceDescription aplChoice={AplCheck.chooseApl(info)} />
        <p>
          <strong>
            It is important to note that using abilites like{' '}
            <SpellLink spell={modules.invokeChiJi.getCelestialTalent()} /> have their own priority
            that supercedes the priority list below. This section omits all casts in those windows.
          </strong>
        </p>
        <SubSection>
          <AplSectionData
            checker={AplCheck.check}
            apl={AplCheck.apl(info)}
            violationExplainers={explainers}
          />
        </SubSection>
      </Section>
      <Section title="Other cooldowns, buffs, and procs">
        {info.combatant.hasTalent(TALENTS_MONK.LIFE_COCOON_TALENT) &&
          modules.lifeCocoon.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.CHI_BURST_SHARED_TALENT) &&
          modules.chiBurst.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT) &&
          modules.vivaciousVivification.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT) &&
          modules.zenPulse.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT) &&
          modules.strengthOfTheBlackOx.guideSubsection}
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
      prepping and executing your cooldowns.
      {modules.hotCountGraph.plot}
    </SubSection>
  );
}

function RemGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> Graph
      </strong>{' '}
      - this graph shows how many <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> you have
      over the course of the fight in relation to your{' '}
      <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> and{' '}
      <SpellLink spell={SPELLS.VIVIFY} /> casts.
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
          <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} />
        </b>{' '}
        is a potent AoE spot heal and grants extremely strong throughput buffs when talented into{' '}
        <SpellLink spell={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />. If talented into{' '}
        <SpellLink spell={TALENTS_MONK.VEIL_OF_PRIDE_TALENT} />, then try to cast{' '}
        <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> as a powerful spot heal when you
        have at least 4 stacks, while trying to avoid excessive overhealing. If talented into{' '}
        <SpellLink spell={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} />, aim to cast{' '}
        <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> before spamming{' '}
        <SpellLink spell={SPELLS.VIVIFY} /> during a{' '}
        <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> peak (8-10+ active HoTs) or before
        casting{' '}
        {info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) ? (
          <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} />
        ) : (
          <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} />
        )}
        . You can cast <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> with as little as 1
        stack before casting <SpellLink spell={TALENTS_MONK.REVIVAL_TALENT} /> in order to try to
        fish for <SpellLink spell={SPELLS.LESSON_OF_DOUBT_BUFF} /> to gain a significant healing
        boost to one of your major raid cooldowns.
      </p>
    </>
  );

  const data = (
    <div>
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> cloud efficiency
          </strong>
          {modules.sheilunsGiftCloudGraph.plot}
        </RoundedPanel>
      </div>
      <br />
      <RoundedPanel>
        <div style={styleObj}>
          <SpellIcon spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} style={{ height: '28px' }} />{' '}
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
        spellId={
          info.combatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT)
            ? TALENTS_MONK.RESTORAL_TALENT.id
            : TALENTS_MONK.REVIVAL_TALENT.id
        }
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    </SubSection>
  );
}
