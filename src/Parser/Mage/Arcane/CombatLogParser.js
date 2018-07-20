import React from 'react';

import Tab from 'Main/Tab';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Mana from './Modules/Mana';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Channeling from './Modules/Features/Channeling';

import ArcaneMissiles from './Modules/Features/ArcaneMissiles';
import Evocation from './Modules/Features/Evocation';

import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';
import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    channeling: Channeling,
    cancelledCasts: CancelledCasts,
    arcaneMissiles: ArcaneMissiles,
    evocation: Evocation,

    // Talents
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,
  };

  generateResults(...args) {
    const results = super.generateResults(...args);

    // TODO: Suggestion for enchants

    results.tabs = [
      ...results.tabs,
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
