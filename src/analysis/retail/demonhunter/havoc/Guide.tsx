import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/demonhunter/vengeance/CombatLogParser';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS/demonhunter';
import { getElysianDecreeSpell } from 'analysis/retail/demonhunter/shared/constants';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <CoreRotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
    </>
  );
}

function ResourceUsageSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Resource Use">
      <SubSection title="Fury">
        <p>
          Havoc's primary resource is Fury. Typically, ability use will be limited by Fury, not
          time. You should avoid capping Fury - lost Fury generation is lost DPS.
        </p>
        The chart below shows your Fury over the course of the encounter. You spent{' '}
        <strong>{formatPercentage(modules.furyTracker.percentAtCap, 1)}%</strong> of the encounter
        capped on Fury.
        {modules.furyGraph.plot}
      </SubSection>
    </Section>
  );
}

function CooldownSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Havoc's cooldowns are decently powerful but should not be held on to for long. In order to
        maximize usages over the course of an encounter, you should aim to send the cooldown as soon
        as it becomes available (as long as it can do damage on target) It is particularly important
        to use <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC.id} /> as often as possible.
        <br />
        <br />
        <strong>Per-spell guidance and statistics coming soon!</strong>
      </p>
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
      <SubSection>
        {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT) &&
          modules.theHunt.havocGuideCastBreakdown()}
      </SubSection>
    </Section>
  );
}

function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation">
      <p>
        Havoc's core rotation is performing <strong>builder</strong> abilites to generate Fury, then
        using a <strong>spender</strong> ability. Refer to the spec guide for{' '}
        <a
          href="https://www.wowhead.com/havoc-demon-hunter-rotation-guide"
          target="_blank"
          rel="noopener noreferrer"
        >
          rotation details
        </a>
        . See below for spell usage details.
      </p>
      <p>TODO ADD ROTATION DETAILS</p>
    </Section>
  );
}

function CooldownGraphSubsection({ info }: GuideProps<typeof CombatLogParser>) {
  const hasEssenceBreak = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT);
  const hasEyeBeam = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT);
  const hasGlaiveTempest = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT);
  const hasFelBarrage = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT);
  const hasElysianDecree = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT);
  const hasTheHunt = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT);
  const hasVengefulRetreat = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT);
  const hasInitiative = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.INITIATIVE_TALENT);
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={SPELLS.METAMORPHOSIS_HAVOC.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      {hasEssenceBreak && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasEyeBeam && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasElysianDecree && (
        <CastEfficiencyBar
          spellId={getElysianDecreeSpell(info.combatant).id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasTheHunt && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasGlaiveTempest && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasFelBarrage && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasInitiative && hasVengefulRetreat && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
    </SubSection>
  );
}
