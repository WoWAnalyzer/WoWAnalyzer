/* TODO: BfA Edition!
 * Rising Mist - Poor use suggestions
 * Upwelling - Additional healing added from channel, missed healing from channel?
 * Mana Tea vs SotC - Potentially compare common output of each talent.
 *    Suggest using one over the other?
 * Vivify or REM - Missed Vivify healing from less than 2 REMs out
 * Azerite Bonus Placeholders
 */

import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import Tab from 'Interface/Others/Tab';
import MonkSpreadsheet from 'Interface/Others/MonkSpreadsheet';
import LowHealthHealing from 'Parser/Core/Modules/Features/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import GlobalCooldown from './Modules/Core/GlobalCooldown';
import Channeling from './Modules/Core/Channeling';
import HotTracker from './Modules/Core/HotTracker';

// Normalizers
import HotApplicationNormalizer from './Modules/Normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './Modules/Normalizers/HotRemovalNormalizer';

// Features
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import EssenceFontMastery from './Modules/Features/EssenceFontMastery';
import Checklist from './Modules/Features/Checklist/Module';
import StatValues from './Modules/Features/StatValues';

// Spells
import ThunderFocusTea from './Modules/Spells/ThunderFocusTea';
import EssenceFont from './Modules/Spells/EssenceFont';
import EnvelopingMists from './Modules/Spells/EnvelopingMists';
import SoothingMist from './Modules/Spells/SoothingMist';
import Vivify from './Modules/Spells/Vivify';
import LifeCocoon from './Modules/Spells/LifeCocoon';
import AzeriteTraits from './Modules/Spells/AzeriteTraits';

// Talents
import ChiJi from './Modules/Talents/ChiJi';
import ChiBurst from './Modules/Talents/ChiBurst';
import ManaTea from './Modules/Talents/ManaTea';
import RefreshingJadeWind from './Modules/Talents/RefreshingJadeWind';
import Lifecycles from './Modules/Talents/Lifecycles';
import SpiritOfTheCrane from './Modules/Talents/SpiritOfTheCrane';
import RisingMist from './Modules/Talents/RisingMist';

// Azerite Traits
import FontOfLife from './Modules/Spells/AzeriteTraits/FontOfLife';
import InvigoratingBrew from './Modules/Spells/AzeriteTraits/InvigoratingBrew';
import UpliftedSpirits from './Modules/Spells/AzeriteTraits/UpliftedSpirits';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizer
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotRemovalNormalizer: HotRemovalNormalizer,

    // Core
    lowHealthHealing: LowHealthHealing,
    healingDone: [HealingDone, { showStatistic: true }],
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    hotTracker: HotTracker,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    essenceFontMastery: EssenceFontMastery,
    checklist: Checklist,
    statValues: StatValues,

    // Spells
    essenceFont: EssenceFont,
    thunderFocusTea: ThunderFocusTea,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist, // Removed as this needs to be reworked with updated Soothing Mist Spell in BfA
    vivify: Vivify,
    lifeCocoon: LifeCocoon,
    azeriteTraits: AzeriteTraits,

    // Talents
    chiBurst: ChiBurst,
    chiJi: ChiJi,
    manaTea: ManaTea,
    refreshingJadeWind: RefreshingJadeWind,
    lifecycles: Lifecycles,
    spiritOfTheCrane: SpiritOfTheCrane,
    risingMist: RisingMist,

    // Azerite Traits
    fontOfLife: FontOfLife,
    upliftedSpirits: UpliftedSpirits,
    invigoratingBrew: InvigoratingBrew,
  };

  generateResults(...args) {
    const results = super.generateResults(...args);

    results.tabs = [
      ...results.tabs,
      {
        title: 'Player Log Data',
        url: 'player-log-data',
        render: () => (
          <Tab style={{ padding: '15px 22px 15px 15px' }}>
            <MonkSpreadsheet parser={this} />
          </Tab>
        ),
      },
    ];
    return results;
  }
}

export default CombatLogParser;
