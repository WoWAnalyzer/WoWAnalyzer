import React from 'react';

import Tab from 'Main/Tab';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import AtonementSuccessiveDamageNormalizer from './Normalizers/AtonementSuccessiveDamage';
import EstelNormalizer from './Normalizers/EstelNormalizer';
import ShadowfiendNormalizer from './Normalizers/ShadowfiendNormalizer';
import PowerWordRadianceNormalizer from './Normalizers/PowerWordRadianceNormalizer';

import Abilities from './Modules/Abilities';
import SpellUsable from './Modules/Core/SpellUsable';
import SpellManaCost from './Modules/Core/SpellManaCost';
import AbilityTracker from './Modules/Core/AbilityTracker';
import Channeling from './Modules/Core/Channeling';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import PowerWordShieldWasted from './Modules/Features/PowerWordShieldWasted';
import AtonementApplicationSource from './Modules/Features/AtonementApplicationSource';
import AtonementDamageSource from './Modules/Features/AtonementDamageSource';
import AtonementHealingDone from './Modules/Features/AtonementHealingDone';
import PowerWordBarrier from './Modules/Features/PowerWordBarrier';
import LeniencesReward from './Modules/Features/LeniencesReward';
import PurgeTheWicked from './Modules/Features/PurgeTheWicked';

import TwistOfFate from './Modules/Spells/TwistOfFate';
import Castigation from './Modules/Spells/Castigation';
import Atonement from './Modules/Spells/Atonement';
import Evangelism from './Modules/Spells/Evangelism';
import Penance from './Modules/Spells/Penance';
import TouchOfTheGrave from './Modules/Spells/TouchOfTheGrave';
import Rapture from './Modules/Spells/Rapture';

import BorrowedTime from './Modules/Spells/Traits/BorrowedTime';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    atonementSuccessiveDamage: AtonementSuccessiveDamageNormalizer,
    estelNormalizer: EstelNormalizer,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    powerWordRadianceNormalizer: PowerWordRadianceNormalizer,

    healingDone: [HealingDone, { showStatistic: true }],
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Abilities
    penance: Penance,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    powerWordShieldWasted: PowerWordShieldWasted,
    atonementApplicationSource: AtonementApplicationSource,
    atonementDamageSource: AtonementDamageSource,
    atonementHealingDone: AtonementHealingDone,
    powerWordBarrier: PowerWordBarrier,
    leniencesReward: LeniencesReward,
    purgeTheWicked: PurgeTheWicked,
    rapture: Rapture,

    // Items:

    // Spells (talents and traits):
    twistOfFate: TwistOfFate,
    castigation: Castigation,
    atonement: Atonement,
    evangelism: Evangelism,
    touchOfTheGrave: TouchOfTheGrave,
    borrowedTime: BorrowedTime,
  };

  generateResults() {
    const results = super.generateResults();

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
