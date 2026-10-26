import { formatDuration } from 'common/format';
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
import { TipBox } from 'interface/guide/components';
import { defaultExplainers } from 'interface/guide/components/Apl/violations/claims';
import { filterCelestial } from './modules/core/apl/ExplainCelestial';
import { getCurrentCelestialTalent, getCurrentRSKTalent } from './constants';
import DefensivesGuide from './modules/core/defensives/DefensivesGuide';
import ActiveTimeGuide from './modules/features/ActiveTimeGuide';

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
        {(info.combatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT) ||
          info.combatant.hasTalent(TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT)) &&
          modules.risingSunKick.guideSubsection}
        {modules.thunderFocusTea.guideSubsection}
        {!info.combatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT) &&
          modules.vivify.guideSubsection}
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
        {info.combatant.hasTalent(modules.revival.activeTalent) &&
          modules.revival.guideCastBreakdown}
        {info.combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT) &&
          modules.celestialConduit.guideCastBreakdown}
        <HotGraphSubsection modules={modules} events={events} info={info} />
      </Section>

      <Section title="Core Rotation">
        <p>
          Healers do not have a static rotation, but Mistweaver gameplay is still driven by a
          priority list that is valid in the majority of situations. When using an ability, aim to
          use the abilities that are highest on the list.
        </p>
        <AplChoiceDescription aplChoice={AplCheck.chooseApl(info)} />
        <TipBox type="info">
          It is important to note that using abilites like{' '}
          <SpellLink spell={getCurrentCelestialTalent(info.combatant)} /> have their own priority
          that supercedes the priority list below. This section omits all casts in those windows.
        </TipBox>
        <SubSection>
          <AplSectionData
            checker={AplCheck.check}
            apl={AplCheck.apl(info)}
            violationExplainers={explainers}
          />
        </SubSection>
        <hr />
        <ActiveTimeGuide />
      </Section>

      {modules.manaGraph.active && (
        <Section title="Mana">
          <ManaGraphSubsection modules={modules} events={events} info={info} />
          <ManaTeaGraphSubsection modules={modules} events={events} info={info} />
        </Section>
      )}

      <Section title="Other cooldowns, buffs, and procs">
        {info.combatant.hasTalent(TALENTS_MONK.LIFE_COCOON_TALENT) &&
          modules.lifeCocoon.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT) &&
          modules.vivaciousVivification.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT) &&
          modules.zenPulse.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT) &&
          modules.spiritfont.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT) &&
          modules.strengthOfTheBlackOx.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.DANCE_OF_CHI_JI_MISTWEAVER_TALENT) &&
          modules.danceOfChiJi.guideSubsection}
      </Section>

      <DefensivesGuide />

      <PreparationSection />
    </>
  );
}

function HotGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Healing Amp Graph</strong> - This graph shows the number of non-Renewing Mist healing
      amps you had active over the course of the encounter. It can help you evaluate how effective
      you were at prepping and executing your cooldowns.
      {modules.hotCountGraph.plot}
    </SubSection>
  );
}

function RemGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> Graph
      </strong>{' '}
      - this graph shows how many <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> you have over the
      course of the fight in relation to your{' '}
      <SpellLink spell={getCurrentRSKTalent(info.combatant)} /> and{' '}
      <SpellLink spell={SPELLS.VIVIFY} /> casts.
      <div style={{ marginTop: '1.5em' }}>{modules.remGraph.plot}</div>
    </SubSection>
  );
}

function ManaGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>Mana Graph</strong> - this graph shows your mana over the course of the fight.
      Diamonds mark <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> channels, and red ones
      overcapped your mana.
      {modules.manaGraph.cooldowns.length > 0 && (
        <>
          {' '}
          The shaded regions mark where{' '}
          <SpellLink spell={getCurrentCelestialTalent(info.combatant)} /> was active.
        </>
      )}
      {modules.manaGraph.innervateWindows.length > 0 && (
        <>
          {' '}
          Purple areas mark when you had <SpellLink spell={SPELLS.INNERVATE} />.
        </>
      )}
      <div style={{ marginTop: '1.5em' }}>{modules.manaGraph.plot}</div>
    </SubSection>
  );
}

function ManaTeaGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      <strong>
        <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> Graph
      </strong>{' '}
      - this graph shows how many <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> stacks you have
      over the course of the fight. Red areas mark time spent at the stack cap, where new stacks are
      wasted.
      {modules.manaTeaGraph.timeAtCap > 0 && (
        <>
          You spent <strong>{formatDuration(modules.manaTeaGraph.timeAtCap)}</strong> at the cap.
        </>
      )}
      {info.combatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT) && (
        <>
          {' '}
          Circles mark <SpellLink spell={TALENTS_MONK.LIFECYCLES_TALENT} /> procs consumed by{' '}
          <SpellLink
            spell={
              info.combatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT)
                ? TALENTS_MONK.SHEILUNS_GIFT_TALENT
                : SPELLS.VIVIFY
            }
          />
          , and squares those consumed by <SpellLink spell={getCurrentRSKTalent(info.combatant)} />{' '}
          or <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />. Red ones were wasted at the
          stack cap, and orange ones were wasted by a refresh or expiry before they were used.
        </>
      )}
      {info.combatant.hasTalent(TALENTS_MONK.REFRESHMENT_TALENT) && (
        <>
          {' '}
          Diamonds mark <SpellLink spell={TALENTS_MONK.LIFE_COCOON_TALENT} /> casts, which grant
          stacks through <SpellLink spell={TALENTS_MONK.REFRESHMENT_TALENT} />, so avoid casting it
          near the stack cap.
        </>
      )}
      <div style={{ marginTop: '1.5em' }}>{modules.manaTeaGraph.plot}</div>
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
        is a potent AoE group heal. If talented into{' '}
        <SpellLink spell={TALENTS_MONK.VEIL_OF_PRIDE_TALENT} />, then try to cast{' '}
        <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> as a powerful spot heal when you
        have at least 4 stacks, while trying to avoid excessive overhealing.
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
  const invokeSpell = info.combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
    ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT
    : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT;
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spell={invokeSpell}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      <CastEfficiencyBar
        spell={
          info.combatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT)
            ? TALENTS_MONK.RESTORAL_TALENT
            : TALENTS_MONK.REVIVAL_TALENT
        }
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      {info.combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT) && (
        <CastEfficiencyBar
          spell={TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}
