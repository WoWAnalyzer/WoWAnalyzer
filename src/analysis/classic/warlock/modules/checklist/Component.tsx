import { Trans } from '@lingui/macro';
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

const curseOfTheElements = <Trans id="warlock.wotlk.shared.curses.curseOfElements"></Trans>;
const curseOfDoom = <Trans id="warlock.wotlk.shared.curses.curseOfDoom"></Trans>;
const curseOfAgony = <Trans id="warlock.wotlk.shared.curses.curseOfAgony"></Trans>;

const WarlockChecklist = ({ thresholds, castEfficiency, combatant }: ChecklistProps) => (
  <Checklist>
    <Rule
      name={<Trans id="warlock.wotlk.checklist.avoidBeingInactive"></Trans>}
      description={
        <>
          <Trans id="warlock.wotlk.checklist.avoidBeingInactive.description"></Trans>
        </>
      }
    >
      <Requirement
        name={<Trans id="warlock.wotlk.checklist.downtime"></Trans>}
        thresholds={thresholds.downtimeSuggestionThresholds}
      />
    </Rule>
    <Rule
      name={<Trans id="warlock.wotlk.checklist.maintainCurse"></Trans>}
      description={
        <Fragment>
          <Trans id="warlock.wotlk.checklist.maintainCurse.description">
            <SpellLink id={CURSE_OF_THE_ELEMENTS}>{curseOfTheElements}</SpellLink>
            <SpellLink id={CURSE_OF_DOOM}>{curseOfDoom}</SpellLink>
            <SpellLink id={CURSE_OF_AGONY}>{curseOfAgony}</SpellLink>
          </Trans>
        </Fragment>
      }
      performanceMethod={PERFORMANCE_METHOD.FIRST}
    >
      <Requirement name="Total Curse Uptime" thresholds={thresholds.curses} />
      <DotUptime id={CURSE_OF_THE_ELEMENTS} thresholds={thresholds.curseOfTheElements} />
      <DotUptime id={CURSE_OF_DOOM} thresholds={thresholds.curseOfDoom} />
      <DotUptime id={CURSE_OF_AGONY} thresholds={thresholds.curseOfAgony} />
    </Rule>
    <PreparationRule thresholds={thresholds} />
  </Checklist>
);

export default WarlockChecklist;
