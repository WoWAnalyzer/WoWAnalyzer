import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS/classic/warlock';
import { SpellLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import { PERFORMANCE_METHOD } from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/classic/modules/features/Checklist/PreparationRule';
import { Fragment } from 'react';

const DotUptime = (props: DotUptimeProps) => (
  <Requirement
    name={
      <>
        <SpellLink id={props.id} icon /> uptime
      </>
    }
    thresholds={props.thresholds}
  />
);

const curseOfTheElements = (
  <Trans id="warlock.wotlk.shared.curses.curseOfElements">Curse of Elements</Trans>
);
const curseOfDoom = <Trans id="warlock.wotlk.shared.curses.curseOfDoom">Curse of Doom</Trans>;
const curseOfAgony = <Trans id="warlock.wotlk.shared.curses.curseOfAgony">Curse of Elements</Trans>;

const WarlockChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => (
  <Checklist>
    <Rule
      name={
        <Trans id="warlock.wotlk.checklist.avoidBeingInactive">
          Avoid being inactive during the fight
        </Trans>
      }
      description={
        <>
          <Trans id="warlock.wotlk.checklist.avoidBeingInactive.description">
            High downtime is something to avoid. You can reduce your downtime by reducing the delay
            between casting abilities, anticipating movement, and moving during the GCD.
          </Trans>
        </>
      }
    >
      <Requirement
        name={<Trans id="warlock.wotlk.checklist.downtime">Downtime</Trans>}
        thresholds={thresholds.downtimeSuggestionThresholds}
      />
    </Rule>
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
            \(using Ebon Plaguebringer\) or Boomkin \(using Earth and Moon\) in the raid, use{' '}
            <SpellLink id={SPELLS.CURSE_OF_THE_ELEMENTS.id}>{curseOfTheElements}</SpellLink>. After
            the priority curse consideration, use{' '}
            <SpellLink id={SPELLS.CURSE_OF_DOOM.id}>{curseOfDoom}</SpellLink> for a target alive
            more than a minute or{' '}
            <SpellLink id={SPELLS.CURSE_OF_AGONY.id}>{curseOfAgony}</SpellLink> for a target alive
            less than a minute.
          </Trans>
        </Fragment>
      }
      performanceMethod={PERFORMANCE_METHOD.FIRST}
    >
      <Requirement name="Total Curse Uptime" thresholds={thresholds.curses} />
      <DotUptime id={SPELLS.CURSE_OF_THE_ELEMENTS.id} thresholds={thresholds.curseOfTheElements} />
      <DotUptime id={SPELLS.CURSE_OF_DOOM.id} thresholds={thresholds.curseOfDoom} />
      <DotUptime id={SPELLS.CURSE_OF_AGONY.id} thresholds={thresholds.curseOfAgony} />
    </Rule>
    <PreparationRule thresholds={thresholds} />
  </Checklist>
);

export default WarlockChecklist;
