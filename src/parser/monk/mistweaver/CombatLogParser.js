/* TODO: BfA Edition!
 * Rising Mist - Poor use suggestions
 * Upwelling - Additional healing added from channel, missed healing from channel?
 * Mana Tea vs SotC - Potentially compare common output of each talent.
 *    Suggest using one over the other?
 * Vivify or REM - Missed Vivify healing from less than 2 REMs out
 * Azerite Bonus Placeholders
 */

import React from 'react';

import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Tab from 'interface/others/Tab';
import MonkSpreadsheet from 'interface/others/MonkSpreadsheet';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import HealingDone from 'parser/shared/modules/HealingDone';

import GlobalCooldown from './modules/core/GlobalCooldown';
import Channeling from './modules/core/Channeling';
import HotTracker from './modules/core/HotTracker';

// Normalizers
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';

// Features
import Abilities from './modules/features/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import EssenceFontMastery from './modules/features/EssenceFontMastery';
import Checklist from './modules/features/Checklist/Module';
import StatValues from './modules/features/StatValues';
import CastRatio from './modules/features/CastRatio';

// Spells
import ThunderFocusTea from './modules/spells/ThunderFocusTea';
import EssenceFont from './modules/spells/EssenceFont';
import EnvelopingMists from './modules/spells/EnvelopingMists';
import SoothingMist from './modules/spells/SoothingMist';
import Vivify from './modules/spells/Vivify';
import LifeCocoon from './modules/spells/LifeCocoon';
import AzeriteTraits from './modules/spells/AzeriteTraits';

// Talents
import JadeSerpentStatue from './modules/talents/JadeSerpentStatue';
import ChiJi from './modules/talents/ChiJi';
import ChiBurst from './modules/talents/ChiBurst';
import ManaTea from './modules/talents/ManaTea';
import RefreshingJadeWind from './modules/talents/RefreshingJadeWind';
import Lifecycles from './modules/talents/Lifecycles';
import SpiritOfTheCrane from './modules/talents/SpiritOfTheCrane';
import RisingMist from './modules/talents/RisingMist';

// Azerite Traits
import FontOfLife from './modules/spells/azeritetraits/FontOfLife';
import InvigoratingBrew from './modules/spells/azeritetraits/InvigoratingBrew';
import UpliftedSpirits from './modules/spells/azeritetraits/UpliftedSpirits';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

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
    castRatio: CastRatio,

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
    jadeSerpentStatue: JadeSerpentStatue,

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
