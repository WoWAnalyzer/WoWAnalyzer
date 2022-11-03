import { GuideProps, Section, SubSection, useInfo } from 'interface/guide';
import CombatLogParser from 'analysis/retail/demonhunter/vengeance/CombatLogParser';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { CooldownBar, GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS/demonhunter';
import { getElysianDecreeSpell } from 'analysis/retail/demonhunter/shared/constants';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import ITEMS from 'common/ITEMS';
import GEAR_SLOTS from 'game/GEAR_SLOTS';

import DemonSpikesSection from './modules/spells/DemonSpikes/GuideSection';
import FieryBrandSection from './modules/talents/FieryBrand/GuideSection';
import VoidReaverSection from './modules/talents/VoidReaver/GuideSection';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

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

function MitigationSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Defensive Cooldowns and Mitigation">
      <SubSection title="Metamorphosis">
        <ExplanationRow>
          <Explanation>
            <p>
              <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> is a massive life and survivability
              increase. You should aim to have it active whenever you will be actively tanking large
              hits.
            </p>
          </Explanation>
          <strong>Metamorphosis overview coming soon!</strong>
        </ExplanationRow>
      </SubSection>
      <DemonSpikesSection />
      <FieryBrandSection />
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT) && <VoidReaverSection />}
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
  const hasFieryDemise =
    info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT) &&
    info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT);
  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      <div className="flex-main chart" style={{ padding: 5 }}>
        <CooldownBar
          spellId={SPELLS.METAMORPHOSIS_TANK.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      </div>
      {hasSoulCarver && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {hasFelDevastation && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {hasElysianDecree && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={getElysianDecreeSpell(info.combatant).id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {hasTheHunt && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {hasSoulBarrier && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {hasBulkExtraction && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
      {hasFieryDemise && (
        <div className="flex-main chart" style={{ padding: 5 }}>
          <CooldownBar
            spellId={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id}
            gapHighlightMode={GapHighlight.FullCooldown}
          />
        </div>
      )}
    </SubSection>
  );
}
