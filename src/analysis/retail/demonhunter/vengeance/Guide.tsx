import { GuideProps, Section, SubSection, useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { ResourceLink, SpellLink } from 'interface';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import FuryCapWaste from 'analysis/retail/demonhunter/shared/guide/FuryCapWaste';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { HideGoodCastsToggle } from 'interface/guide/components/HideGoodCastsToggle';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

import CombatLogParser from './CombatLogParser';
import MajorDefensives from './modules/core/MajorDefensives';
import {
  GOOD_TIME_AT_FURY_CAP,
  OK_TIME_AT_FURY_CAP,
  PERFECT_TIME_AT_FURY_CAP,
} from './modules/resourcetracker/FuryTracker';
import { PerformanceStrong } from 'analysis/retail/priest/shadow/modules/guide/ExtraComponents';
import { formatPercentage } from 'common/format';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <CoreSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <MitigationSection />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function CoreSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  const percentAtFuryCap = modules.furyTracker.percentAtCap;
  const percentAtFuryCapPerformance = modules.furyTracker.percentAtCapPerformance;
  const furyWasted = modules.furyTracker.wasted;

  return (
    <Section title="Core">
      <SubSection title="Fury">
        <p>
          Vengeance's primary resource is <ResourceLink id={RESOURCE_TYPES.FURY.id} />. You should
          avoid capping <ResourceLink id={RESOURCE_TYPES.FURY.id} /> - lost{' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> generation is lost DPS.
        </p>
        <FuryCapWaste
          percentAtCap={percentAtFuryCap}
          percentAtCapPerformance={percentAtFuryCapPerformance}
          perfectTimeAtFuryCap={PERFECT_TIME_AT_FURY_CAP}
          goodTimeAtFuryCap={GOOD_TIME_AT_FURY_CAP}
          okTimeAtFuryCap={OK_TIME_AT_FURY_CAP}
          wasted={furyWasted}
        />
        {modules.furyGraph.plot}
      </SubSection>
      <SubSection title="Soul Fragments">
        <p>
          Most of your abilities either <strong>build</strong> or <strong>spend</strong> Soul
          Fragments. Never use a builder at max <SpellLink spell={SPELLS.SOUL_FRAGMENT} />s or when
          doing so will cause you to overcap on <SpellLink spell={SPELLS.SOUL_FRAGMENT} />
          s.
        </p>
        <p>
          The chart below shows your <SpellLink spell={SPELLS.SOUL_FRAGMENT} />s over the course of
          the encounter.
        </p>
        {modules.soulFragmentsGraph.plot}
      </SubSection>
      <SubSection title="Active Time">
        <p>
          <b>
            Continuously casting throughout an encounter is the single most important thing for
            achieving good DPS.
          </b>
          <br />
          Some fights have unavoidable downtime due to phase transitions and the like, so in these
          cases 0% downtime will not be possible - do the best you can.
        </p>
        <p>
          Active Time:{' '}
          <PerformanceStrong performance={modules.alwaysBeCasting.DowntimePerformance}>
            {formatPercentage(modules.alwaysBeCasting.activeTimePercentage, 1)}%
          </PerformanceStrong>{' '}
        </p>
        <ActiveTimeGraph
          activeTimeSegments={modules.alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
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
      <MajorDefensives />
    </Section>
  );
}

function RotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Rotation">
      <p>
        Vengeance's core rotation involves <strong>building</strong> and then{' '}
        <strong>spending</strong> <ResourceLink id={RESOURCE_TYPES.FURY.id} /> and{' '}
        <SpellLink spell={SPELLS.SOUL_FRAGMENT} />
        s, which heal for 6% of damage taken in the 5 seconds before they are absorbed.
      </p>
      <br />
      <HideExplanationsToggle id="hide-explanations-rotation" />
      <HideGoodCastsToggle id="hide-good-casts-rotation" />
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FRACTURE_TALENT) &&
        modules.fracture.guideSubsection()}
      {modules.immolationAura.vengeanceGuideSubsection()}
      {modules.sigilOfFlame.guideSubsection()}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT) &&
        modules.spiritBomb.guideSubsection()}
      {modules.soulCleave.guideSubsection()}
    </Section>
  );
}

const cooldowns: Cooldown[] = [
  {
    spell: TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT),
  },
  {
    spell: TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT),
  },
  {
    spell: TALENTS_DEMON_HUNTER.SIGIL_OF_SPITE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.SIGIL_OF_SPITE_TALENT),
  },
  {
    spell: TALENTS_DEMON_HUNTER.THE_HUNT_TALENT,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT),
  },
  {
    spell: TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT),
  },
  {
    spell: TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT,
    isActive: (c) => c.hasTalent(TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT),
  },
  {
    spell: TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT) &&
      c.hasTalent(TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT),
  },
];
function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <p>
        Vengeance has multiple cooldowns that it can use to increase survivability or do large
        amounts of damage. In order to maximize usages over the course of an encounter, you should
        aim to send the cooldown as soon as it becomes available (as long as it can do damage on
        target) if you won't need it for an upcoming mechanic. It is particularly important to use{' '}
        <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT} /> as often as possible.
      </p>
      <HideExplanationsToggle id="hide-explanations-cooldowns" />
      <HideGoodCastsToggle id="hide-good-casts-cooldowns" />
      <CooldownGraphSubsection cooldowns={cooldowns} />
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT) && (
        <CooldownUsage analyzer={modules.felDevastation} />
      )}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT) && (
        <CooldownUsage analyzer={modules.theHunt} />
      )}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT) && (
        <CooldownUsage analyzer={modules.soulCarver} />
      )}
    </Section>
  );
}
