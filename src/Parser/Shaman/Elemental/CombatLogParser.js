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


import MaelstromChart from '../Shared/MaelstromChart/Maelstrom';
import MaelstromTracker from '../Shared/MaelstromChart/MaelstromTracker';



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


    maelstromTracker: MaelstromTracker,
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
    results.tabs = [
      ...results.tabs,
      { // TODO: Move this to an Analyzer module
        title: 'Maelstrom Chart',
        url: 'maelstrom',
        render: () => (
          <Tab title='Maelstrom' style={{ padding: '15px 22px' }}>
            <MaelstromChart
              start={this.fight.start_time}
              end={this.fight.end_time}
              playerHaste={this.modules.combatants.selected.hasteRating}
              maelstromMax={this.modules.maelstromTracker._maxMaelstrom}
              maelstromPerSecond={this.modules.maelstromTracker.maelstromBySecond}
              tracker={this.modules.maelstromTracker.tracker}
              secondsCapped={this.modules.maelstromTracker.secondsCapped}
              activeMaelstromGenerated={this.modules.maelstromTracker.activeFocusGenerated}
              activeMaelstromWasted={this.modules.maelstromTracker.activeFocusWasted}
              generatorCasts={this.modules.maelstromTracker.generatorCasts}
              activeMaelstromWastedTimeline={this.modules.maelstromTracker.activeMaelstromWastedTimeline}
            />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
