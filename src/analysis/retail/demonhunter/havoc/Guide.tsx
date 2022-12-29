import { GuideProps, Section, SubSection } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { formatPercentage } from 'common/format';
import { AlertWarning, SpellLink } from 'interface';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { t, Trans } from '@lingui/macro';
import AlertInfo from 'interface/AlertInfo';
import { AplSectionData } from 'interface/guide/components/Apl';
import SPELLS from 'common/SPELLS/demonhunter';
import { PerformanceStrong } from 'analysis/retail/demonhunter/shared/guide/ExtraComponents';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

import * as AplCheck from './apl/AplCheck';
import CombatLogParser from './CombatLogParser';
import CooldownGraphSubsection from './guide/CooldownGraphSubSection';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <RotationSection />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ modules }: GuideProps<typeof CombatLogParser>) {
  const percentAtFuryCap = modules.furyTracker.percentAtCap;
  const percentAtFuryCapPerformance = modules.furyTracker.percentAtCapPerformance;
  const percentAtFuryCapFormatted = formatPercentage(percentAtFuryCap, 1);
  return (
    <Section
      title={t({
        id: 'guide.demonhunter.havoc.sections.resources.title',
        message: 'Resource Use',
      })}
    >
      <SubSection
        title={t({
          id: 'guide.demonhunter.havoc.sections.resources.fury.title',
          message: 'Fury',
        })}
      >
        <p>
          <Trans id="guide.demonhunter.havoc.sections.resources.fury.summary">
            Havoc's primary resource is Fury. Typically, ability use will be limited by Fury, not
            time. You should avoid capping Fury - lost Fury generation is lost DPS.
          </Trans>
        </p>
        <p>
          <Trans id="guide.demonhunter.havoc.sections.resources.fury.chart">
            The chart below shows your Fury over the course of the encounter. You spent{' '}
            <PerformanceStrong performance={percentAtFuryCapPerformance}>
              {percentAtFuryCapFormatted}%
            </PerformanceStrong>{' '}
            of the encounter capped on Fury.
          </Trans>
        </p>
        {modules.furyGraph.plot}
      </SubSection>
    </Section>
  );
}

function CooldownSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section
      title={t({
        id: 'guide.demonhunter.havoc.sections.cooldowns.title',
        message: 'Cooldowns',
      })}
    >
      <AlertInfo>
        This section is under heavy development as work on the Havoc rotation continues during the
        Dragonflight launch.
      </AlertInfo>
      <p>
        <Trans id="guide.demonhunter.havoc.sections.cooldowns.summary">
          Havoc's cooldowns are decently powerful but should not be held on to for long. In order to
          maximize usages over the course of an encounter, you should aim to send the cooldown as
          soon as it becomes available (as long as it can do damage on target).
        </Trans>
      </p>
      <CooldownGraphSubsection />
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} /> coming
            soon!
          </div>,
          <></>,
        )}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT) &&
        modules.theHunt.havocGuideCastBreakdown()}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink id={TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT} />{' '}
            coming soon!
          </div>,
          <></>,
        )}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />{' '}
            coming soon!
          </div>,
          <></>,
        )}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink id={TALENTS_DEMON_HUNTER.GLAIVE_TEMPEST_TALENT} />{' '}
            coming soon!
          </div>,
          <></>,
        )}
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT) &&
        explanationAndDataSubsection(
          <div>
            Per-cast breakdown for <SpellLink id={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT} /> coming
            soon!
          </div>,
          <></>,
        )}
    </Section>
  );
}

function RotationSection() {
  return (
    <Section
      title={t({
        id: 'guide.demonhunter.vengeance.sections.rotation.title',
        message: 'Rotation',
      })}
    >
      <AlertWarning>
        This section is under heavy development as work on the Havoc rotation continues during the
        Dragonflight launch.
      </AlertWarning>
      <p>
        <Trans id="guide.demonhunter.havoc.sections.rotation.summary">
          The Havoc rotation is driven by a <em>priority list</em>. When you are ready to use an
          ability, you should use the highest-priority ability that is available. Doing this
          improves your damage by prioritizing high-damage, high-impact spells like{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.THE_HUNT_TALENT} /> and{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT} /> over low-priority "filler" spells
          like <SpellLink id={SPELLS.THROW_GLAIVE_HAVOC.id} />.
        </Trans>
      </p>
      <AplSectionData checker={AplCheck.check} apl={AplCheck.apl} />
    </Section>
  );
}
