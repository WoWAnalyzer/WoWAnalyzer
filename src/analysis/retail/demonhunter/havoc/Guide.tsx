import { GuideProps, Section, SubSection } from 'interface/guide';
import CombatLogParser from 'analysis/retail/demonhunter/vengeance/CombatLogParser';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { formatPercentage } from 'common/format';
import { AlertWarning } from 'interface';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';

import CooldownGraphSubsection from './guide/CooldownGraphSubSection';
import { t, Trans } from '@lingui/macro';
import AlertInfo from 'interface/AlertInfo';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  return (
    <>
      <ResourceUsageSection modules={modules} events={events} info={info} />
      <RotationSection modules={modules} events={events} info={info} />
      <CooldownSection modules={modules} events={events} info={info} />
      <PreparationSection />
    </>
  );
}

function ResourceUsageSection({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
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
        The chart below shows your Fury over the course of the encounter. You spent{' '}
        <strong>{formatPercentage(modules.furyTracker.percentAtCap, 1)}%</strong> of the encounter
        capped on Fury.
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
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.THE_HUNT_TALENT) &&
        modules.theHunt.havocGuideCastBreakdown()}
    </Section>
  );
}

function RotationSection({ modules, info }: GuideProps<typeof CombatLogParser>) {
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
          Havoc's core rotation is performing <strong>builder</strong> abilites to generate Fury,
          then using a <strong>spender</strong> ability. Refer to the spec guide for{' '}
          <a
            href="https://www.wowhead.com/havoc-demon-hunter-rotation-guide"
            target="_blank"
            rel="noopener noreferrer"
          >
            rotation details
          </a>
          . See below for spell usage details.
        </Trans>
      </p>
    </Section>
  );
}
