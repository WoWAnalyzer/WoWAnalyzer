import React from 'react';

import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import StatisticBox from 'Main/StatisticBox';
import Tab from 'Main/Tab';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Maelstrom from './Modules/Features/Maelstrom/Maelstrom';

import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ProcTracker from './Modules/Features/ProcTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Overload from './Modules/Features/Overload';

import FlameShock from './Modules/ShamanCore/FlameShock';
import ElementalFocus from './Modules/ShamanCore/ElementalFocus';

import Aftershock from './Modules/Talents/Aftershock';
import ElementalBlast from './Modules/Talents/ElementalBlast';
import Ascendance from './Modules/Talents/Ascendance';
import TotemMastery from './Modules/Talents/TotemMastery';
import LightningRod from './Modules/Talents/LightningRod';

import Tier21_2Set from './Modules/Items/Tier21_2set.js';
import Tier21_4Set from './Modules/Items/Tier21_4set.js';

import TheDeceiversBloodPact from './Modules/Items/TheDeceiversBloodPact';

import './Modules/Main/main.css';

function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    procTracker: ProcTracker,
    flameShock: FlameShock,
    overload: Overload,
    elementalFocus: ElementalFocus,

    // Talents
    aftershock: Aftershock,
    elementalBlast: ElementalBlast,
    ascendance: Ascendance,
    totemMastery: TotemMastery,
    lightningRod: LightningRod,

    // Legendaries:
    theDeceiversBloodPact: TheDeceiversBloodPact,

    //Setboni
    tier21_2p: Tier21_2Set,
    tier21_4p: Tier21_4Set,
  };

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;

    const nonDpsTimePercentage = this.modules.alwaysBeCasting.totalDamagingTimeWasted / fightDuration;
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;

    if (nonDpsTimePercentage > 0.3) {
      results.addIssue({
        issue: `[NYI] Your non DPS time can be improved. Try to cast damaging spells more regularly (${Math.round(nonDpsTimePercentage * 100)}% non DPS time).`,
        icon: 'petbattle_health-down',
        importance: getIssueImportance(nonDpsTimePercentage, 0.4, 0.45, true),
      });
    }
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your downtime can be improved. (${Math.round(deadTimePercentage * 100)}% downtime).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }

    results.statistics = [
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Downtime" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label={(
          <dfn data-tip="Downtime is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.">
            Downtime
          </dfn>
        )}
      />,
      ...results.statistics,
    ];

    results.tabs = [
      ...results.tabs,
      { // TODO: Move this to an Analyzer module
        title: 'Maelstrom',
        url: 'maelstrom',
        render: () => (
          <Tab title="Maelstrom" style={{ padding: '15px 22px' }}>
            <Maelstrom
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
