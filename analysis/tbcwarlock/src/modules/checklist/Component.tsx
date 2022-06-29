import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import Checklist from 'parser/shared/modules/features/Checklist';
import {
  ChecklistProps,
  DotUptimeProps,
} from 'parser/shared/modules/features/Checklist/ChecklistTypes';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PreparationRule from 'parser/tbc/modules/features/Checklist/PreparationRule';
import { Fragment } from 'react';

import { CURSE_OF_AGONY, CURSE_OF_DOOM, CURSE_OF_THE_ELEMENTS } from '../../SPELLS';

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

const WarlockChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => (
  <Checklist>
    <Rule
      name={
        <Trans id="tbcwarlock.destruction.modules.checklist.avoidBeingInactive">
          Try to avoid being inactive for a large portion of the fight
        </Trans>
      }
      description={
        <>
          <Trans id="tbcwarlock.destruction.modules.checklist.avoidBeingInactive.description">
            High downtime is something to avoid. You can reduce your downtime by reducing the delay
            between casting abilities, anticipating movement, and moving during the GCD.
          </Trans>
        </>
      }
    >
      <Requirement
        name={<Trans id="tbcwarlock.modules.checklist.downtime">Downtime</Trans>}
        thresholds={thresholds.downtimeSuggestionThresholds}
      />
    </Rule>
    <Rule
      name="Maintain a curse on the primary target"
      description={
        <Fragment>
          It is important to maintain one curse on the primary target. Priority order should be{' '}
          <SpellLink id={CURSE_OF_THE_ELEMENTS} /> over other curses. If elements is on the target
          from another warlock, use <SpellLink id={CURSE_OF_DOOM} /> on a target that lives at least
          a minute. If the target will live for less than a minute, use{' '}
          <SpellLink id={CURSE_OF_AGONY} />
        </Fragment>
      }
    >
      <DotUptime id={CURSE_OF_THE_ELEMENTS} thresholds={thresholds.curseOfTheElements} />
      <DotUptime id={CURSE_OF_DOOM} thresholds={thresholds.curseOfDoom} />
      <DotUptime id={CURSE_OF_AGONY} thresholds={thresholds.curseOfAgony} />
    </Rule>
    <PreparationRule thresholds={thresholds} />
  </Checklist>
);

export default WarlockChecklist;
