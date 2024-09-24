import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/druid/feral/CombatLogParser';
import { TALENTS_DRUID } from 'common/TALENTS';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { ACCEPTABLE_CPS } from 'analysis/retail/druid/feral/constants';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUseSection modules={modules} events={events} info={info} />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <AdvancedRotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUseSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Resource Use">
      <SubSection title="Energy">
        <p>
          Your primary resource is Energy. Typically, ability use will be limited by energy, not
          time. Avoid capping energy - lost energy regeneration is lost DPS. High-end gear combined
          with more energy talents than in previous expansions causes it to be occasionally
          impossible to avoid capping energy, particularly during cooldowns. During these periods,
          it's important to send abilities as fast as possible to maximize DPS.
        </p>
        The chart below shows your energy over the course of the encounter. You spent{' '}
        <strong>{formatPercentage(modules.energyTracker.percentAtCap, 1)}%</strong> of the encounter
        capped on Energy.
        {modules.energyGraph.plot}
      </SubSection>
      <SubSection title="Combo Points">
        <p>
          Most of your abilities either <strong>build</strong> or <strong>spend</strong> Combo
          Points. Never use a builder at max CPs, and always wait until {ACCEPTABLE_CPS} to use a
          spender (with the exception of your opening <SpellLink spell={SPELLS.RIP} />
          ).
        </p>
        <SideBySidePanels>
          <RoundedPanel>{modules.builderUse.chart}</RoundedPanel>
          <RoundedPanel>{modules.finisherUse.chart}</RoundedPanel>
        </SideBySidePanels>
      </SubSection>
    </Section>
  );
}

function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation">
      <p>
        Feral's core rotation involves performing <strong>builder</strong> abilites to gain combo
        points, then using powerful <strong>spender</strong> abilities to consume the combo points.
        Maintain your damage over time effects on targets, then fill with your direct damage
        abilities. Refer to the spec guide for{' '}
        <a
          href="https://www.wowhead.com/feral-druid-rotation-guide"
          target="_blank"
          rel="noopener noreferrer"
        >
          rotation details
        </a>
        .
      </p>
      <p>
        Correct usage of <SpellLink spell={SPELLS.FEROCIOUS_BITE} />,{' '}
        <SpellLink spell={SPELLS.RIP} />, and <SpellLink spell={SPELLS.RAKE} /> are the most
        important factors for high single target damage.
        <b> Master these before optimizing the items in the next section.</b>
      </p>
      {modules.ferociousBite.guideSubsection}
      {modules.ripUptime.guideSubsection}
      {modules.rakeUptime.guideSubsection}
    </Section>
  );
}

function AdvancedRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Advanced Rotation">
      <p>
        Talent choices add new buttons or ability order changes to your rotation. Using them
        correctly will allow you to optimize your DPS. Make sure you have your core rotation down
        before optimizing these.
      </p>
      {info.combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT) &&
        modules.bloodtalons.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.SUDDEN_AMBUSH_TALENT) &&
        modules.suddenAmbush.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.LUNAR_INSPIRATION_TALENT) &&
        modules.moonfireUptime.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.ADAPTIVE_SWARM_TALENT) &&
        modules.adaptiveSwarm.guideSubsection}
      {info.combatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT) &&
        modules.brutalSlash.guideSubsection}
      {modules.hitCountAoe.guideSubsection}
    </Section>
  );
}

function CooldownSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Feral's cooldowns are powerful and should not be held on to for long. In order to maximize
        usages over the course of an encounter, you should aim to send the cooldown as soon as it
        becomes available (as long as it can do damage on target). It is particularly important to
        use <SpellLink spell={SPELLS.TIGERS_FURY} /> as often as possible.
      </p>
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
      <CooldownBreakdownSubsection modules={modules} events={events} info={info} />
    </Section>
  );
}

function CooldownGraphSubsection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasBerserk = info.combatant.hasTalent(TALENTS_DRUID.BERSERK_TALENT);
  const hasIncarn = info.combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT);
  const hasConvoke = info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT);
  const hasFeralFrenzy = info.combatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT);
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={SPELLS.TIGERS_FURY.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
      {hasBerserk && !hasIncarn && (
        <CastEfficiencyBar
          spellId={SPELLS.BERSERK_CAT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {hasIncarn && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {hasConvoke && (
        <CastEfficiencyBar
          spellId={SPELLS.CONVOKE_SPIRITS.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
      {hasFeralFrenzy && (
        <CastEfficiencyBar
          spellId={TALENTS_DRUID.FERAL_FRENZY_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          useThresholds
        />
      )}
    </SubSection>
  );
}

function CooldownBreakdownSubsection({
  modules,
  events,
  info,
}: GuideProps<typeof CombatLogParser>) {
  return (
    <SubSection>
      {info.combatant.hasTalent(TALENTS_DRUID.BERSERK_TALENT) && modules.berserk.guideCastBreakdown}
      {info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) &&
        modules.convokeSpirits.guideCastBreakdown}
      {info.combatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT) &&
        modules.feralFrenzy.guideCastBreakdown}
    </SubSection>
  );
}
