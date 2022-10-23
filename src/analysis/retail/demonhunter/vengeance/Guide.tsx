import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/demonhunter/vengeance/CombatLogParser';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { CooldownBar } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS/demonhunter';
import { getElysianDecreeSpell } from 'analysis/retail/demonhunter/shared/constants';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

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
          Vengeance's primary resource is Fury. Typically, ability use will be limited by Fury, not
          time. You should avoid capping Fury - lost Fury generation is lost DPS.
        </p>
        The chart below shows your Fury over the course of the encounter. You spent{' '}
        <strong>{formatPercentage(modules.furyTracker.percentAtCap, 1)}%</strong> of the encounter
        capped on Fury.
        {modules.furyGraph.plot}
      </SubSection>
      <SubSection title="Soul Fragments">
        <p>
          Most of your abilities either <strong>build</strong> or <strong>spend</strong> Soul
          Fragments. Never use a builder at max Soul Fragments or when doing so will cause you to
          overcap on Soul Fragments.
        </p>
        {modules.soulFragmentsGraph.plot}
      </SubSection>
    </Section>
  );
}

function CoreRotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core Rotation">
      <p>
        Vengeance's core rotation is performing <strong>builder</strong> abilites to generate Fury,
        then using a <strong>spender</strong> ability. You will have priority lists for each
        category:
      </p>
      <SubSection>
        <strong>Builders</strong> generate Fury can generate Soul Fragments.
        <br />
        With your <strong>current talent build</strong>, your priorities are:
        <br />
        <strong>Single-Target:</strong>
        <br />
        <ul />
        <strong>Multi-Target:</strong>
        <br />
        <ul />
      </SubSection>
      <SubSection>
        <strong>Spenders</strong> cost Fury and consume Soul Fragments.
        <br />
        With your <strong>current talent build</strong>, your priorities are:
        <br />
        <strong>Single-Target:</strong>
        <br />
        <ul />
        <strong>Multi-Target:</strong>
        <br />
        <ul />
      </SubSection>
    </Section>
  );
}

function CooldownSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Vengeance has multiple powerful cooldowns that it can use to increase survivability or do
        large amounts of damage. In order to maximize usages over the course of an encounter, you
        should aim to send the cooldown as soon as it becomes available (as long as it can do damage
        on target) if you won't need it for an upcoming mechanic. It is particularly important to
        use <SpellLink id={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id} /> as often as possible.
        <br />
        <br />
        <strong>Per-spell guidance and statistics coming soon!</strong>
      </p>
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
    </Section>
  );
}

function CooldownGraphSubsection({ events, info }: GuideProps<typeof CombatLogParser>) {
  const hasSoulCarver = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT);
  const hasFelDevastation = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT);
  const hasElysianDecree = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT);
  const hasTheHunt = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT);
  const hasSoulBarrier = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT);
  const hasBulkExtraction = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT);
  const hasFieryBrand = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT);
  const hasDarkness = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.DARKNESS_TALENT);
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar
          spellId={SPELLS.METAMORPHOSIS_TANK.id}
          events={events}
          info={info}
          highlightGaps
        />
      </div>
      {hasSoulCarver && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasFelDevastation && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasElysianDecree && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={getElysianDecreeSpell(info.combatant).id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasTheHunt && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasSoulBarrier && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasBulkExtraction && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasDarkness && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
      {hasFieryBrand && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id}
            events={events}
            info={info}
            highlightGaps
          />
        </div>
      )}
    </SubSection>
  );
}
