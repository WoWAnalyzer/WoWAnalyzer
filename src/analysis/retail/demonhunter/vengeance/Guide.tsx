import { GuideProps, Section, SubSection, useInfo } from 'interface/guide';
import CombatLogParser from 'analysis/retail/demonhunter/vengeance/CombatLogParser';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS/demonhunter';
import { getElysianDecreeSpell } from 'analysis/retail/demonhunter/shared/constants';
import { formatPercentage } from 'common/format';
import { AlertWarning, SpellLink } from 'interface';
import ITEMS from 'common/ITEMS';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import DemonSpikesSection from './modules/spells/DemonSpikes/GuideSection';
import FieryBrandSection from './modules/talents/FieryBrand/GuideSection';
import VoidReaverSection from './modules/talents/VoidReaver/GuideSection';
import MetamorphosisSection from './modules/spells/Metamorphosis/GuideSection';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <PreparationSection
        recommendedEnchantments={{
          [GEAR_SLOTS.CHEST]: [
            ITEMS.ENCHANT_CHEST_ETERNAL_SKIRMISH,
            ITEMS.ENCHANT_CHEST_ETERNAL_STATS,
          ],
          [GEAR_SLOTS.FEET]: [ITEMS.ENCHANT_BOOTS_ETERNAL_AGILITY],
          [GEAR_SLOTS.BACK]: [
            ITEMS.ENCHANT_CLOAK_FORTIFIED_LEECH,
            ITEMS.ENCHANT_CLOAK_SOUL_VITALITY,
          ],
          [GEAR_SLOTS.FINGER1]: [ITEMS.ENCHANT_RING_TENET_OF_HASTE],
          [GEAR_SLOTS.FINGER2]: [ITEMS.ENCHANT_RING_TENET_OF_HASTE],
          [GEAR_SLOTS.MAINHAND]: [
            ITEMS.ENCHANT_WEAPON_SINFUL_REVELATION,
            ITEMS.ENCHANT_WEAPON_CELESTIAL_GUIDANCE,
            ITEMS.ENCHANT_WEAPON_LIGHTLESS_FORCE,
          ],
          [GEAR_SLOTS.OFFHAND]: [
            ITEMS.ENCHANT_WEAPON_SINFUL_REVELATION,
            ITEMS.ENCHANT_WEAPON_CELESTIAL_GUIDANCE,
            ITEMS.ENCHANT_WEAPON_LIGHTLESS_FORCE,
          ],
        }}
      />
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <MitigationSection />
      <RotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
    </>
  );
}

function ResourceUsageSection({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Resource Use">
      <SubSection title="Fury">
        <p>
          Vengeance's primary resource is Fury. Typically, ability use will be limited by Fury, not
          time. You should avoid capping Fury - lost Fury generation is lost DPS.
        </p>
        <p>
          The chart below shows your Fury over the course of the encounter. You spent{' '}
          <strong>{formatPercentage(modules.furyTracker.percentAtCap, 1)}%</strong> of the encounter
          capped on Fury.
        </p>
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

function MitigationSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Defensive Cooldowns and Mitigation">
      <MetamorphosisSection />
      <DemonSpikesSection />
      <FieryBrandSection />
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT) && <VoidReaverSection />}
    </Section>
  );
}

function RotationSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <AlertWarning>
        This section is under heavy development as work on the Vengeance rotation continues during
        the Dragonflight pre-patch. It is currently a reasonable starting point, but may not match
        the optimal rotation yet.
      </AlertWarning>
      <p>
        Vengeance's core rotation involves <strong>building</strong> and then{' '}
        <strong>spending</strong> <SpellLink id={SPELLS.SOUL_FRAGMENT} />
        s, which heal for 6% of damage taken in the 5 seconds before they are absorbed.
      </p>
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT) &&
        modules.fracture.guideSubsection()}
      {explanationAndDataSubsection(
        <>
          <strong>
            <SpellLink id={SPELLS.SOUL_CLEAVE} />
          </strong>{' '}
          breakdown coming soon!
        </>,
        <div />,
      )}
      {explanationAndDataSubsection(
        <>
          <strong>
            <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} />
          </strong>{' '}
          breakdown coming soon!
        </>,
        <div />,
      )}
    </Section>
  );
}

function CooldownSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Vengeance has multiple cooldowns that it can use to increase survivability or do large
        amounts of damage. In order to maximize usages over the course of an encounter, you should
        aim to send the cooldown as soon as it becomes available (as long as it can do damage on
        target) if you won't need it for an upcoming mechanic. It is particularly important to use{' '}
        <SpellLink id={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id} /> as often as possible.
        <br />
        <br />
        <strong>Per-spell guidance and statistics coming soon!</strong>
      </p>
      <CooldownGraphSubsection modules={modules} events={events} info={info} />
      <SubSection>
        {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT) &&
          modules.theHunt.vengeanceGuideCastBreakdown()}
      </SubSection>
    </Section>
  );
}

function CooldownGraphSubsection({ info }: GuideProps<typeof CombatLogParser>) {
  const hasSoulCarver = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT);
  const hasFelDevastation = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT);
  const hasElysianDecree = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT);
  const hasTheHunt = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT);
  const hasSoulBarrier = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT);
  const hasBulkExtraction = info.combatant.hasTalent(TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT);
  const hasFieryDemise =
    info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT) &&
    info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT);
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <CastEfficiencyBar
        spellId={SPELLS.METAMORPHOSIS_TANK.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      {hasSoulCarver && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasFelDevastation && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id}
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
      {hasSoulBarrier && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasBulkExtraction && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
      {hasFieryDemise && (
        <CastEfficiencyBar
          spellId={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      )}
    </SubSection>
  );
}
