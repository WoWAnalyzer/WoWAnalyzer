import { Trans } from '@lingui/macro';
import { Fragment } from 'react';
import SPELLS from 'common/SPELLS/classic';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import { PERFORMANCE_METHOD } from 'parser/shared/modules/features/Checklist/Rule';

const ClassicDemonologyChecklist = ({ combatant, castEfficiency, thresholds }: ChecklistProps) => {
  const DotUptime = (props: DotUptimeProps) => (
    <Requirement
      name={
        <>
          <SpellLink spell={props.spell} icon /> uptime
        </>
      }
      thresholds={props.thresholds}
    />
  );

  const curseOfTheElements = (
    <Trans id="warlock.wotlk.shared.curses.curseOfElements">Curse of Elements</Trans>
  );
  const curseOfDoom = <Trans id="warlock.wotlk.shared.curses.curseOfDoom">Curse of Doom</Trans>;
  const curseOfAgony = (
    <Trans id="warlock.wotlk.shared.curses.curseOfAgony">Curse of Elements</Trans>
  );

  return (
    <Checklist>
      <Rule
        name={
          <Trans id="warlock.wotlk.checklist.maintainCurse">
            Maintain a curse on the primary target
          </Trans>
        }
        description={
          <Fragment>
            <Trans id="warlock.wotlk.checklist.maintainCurse.description">
              It is important to maintain a curse on the primary target. If there is no Unholy DK
              (applying <SpellLink spell={SPELLS.EBON_PLAGUE}>Ebon Plague</SpellLink>) or Moonkin
              (applying <SpellLink spell={SPELLS.EARTH_AND_MOON}>Earth and Moon</SpellLink>) in the
              raid, use{' '}
              <SpellLink spell={SPELLS.CURSE_OF_THE_ELEMENTS}>{curseOfTheElements}</SpellLink>.
              After the priority curse consideration, use{' '}
              <SpellLink spell={SPELLS.CURSE_OF_DOOM}>{curseOfDoom}</SpellLink> for a target alive
              more than a minute or{' '}
              <SpellLink spell={SPELLS.CURSE_OF_AGONY}>{curseOfAgony}</SpellLink> for a target alive
              less than a minute.
            </Trans>
          </Fragment>
        }
        performanceMethod={PERFORMANCE_METHOD.FIRST}
      >
        <Requirement name="Total Curse Uptime" thresholds={thresholds.curseUptime} />
        <DotUptime
          spell={SPELLS.CURSE_OF_THE_ELEMENTS}
          thresholds={thresholds.curseOfTheElements}
        />
        <DotUptime spell={SPELLS.CURSE_OF_DOOM} thresholds={thresholds.curseOfDoom} />
        <DotUptime spell={SPELLS.CURSE_OF_AGONY} thresholds={thresholds.curseOfAgony} />
      </Rule>
      <Rule
        name="Maintain DoTs and debuffs"
        description="Demonology Warlocks rely on Damage over Time spells (DoTs) to deal damage. Try to keep your DoT uptime as high as possible."
      >
        <DotUptime spell={SPELLS.CORRUPTION} thresholds={thresholds.corruption} />
        <DotUptime spell={SPELLS.IMMOLATE} thresholds={thresholds.immolate} />
        <DotUptime spell={SPELLS.SHADOW_MASTERY_DEBUFF} thresholds={thresholds.shadowMastery} />
      </Rule>
      <Rule
        name="Always Be Casting"
        description={
          <>
            Try to avoid downtime during the fight. When moving, use your instant abilities or set
            up{' '}
            <SpellLink spell={SPELLS.DEMONIC_CIRCLE_TELEPORT} icon>
              Demonic Circle
            </SpellLink>{' '}
            to reduce your movement.
          </>
        }
      >
        <Requirement name="Downtime" thresholds={thresholds.downtimeSuggestionThresholds} />
      </Rule>
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

export default ClassicDemonologyChecklist;
