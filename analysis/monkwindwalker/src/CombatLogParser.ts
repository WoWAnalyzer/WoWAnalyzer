import CoreCombatLogParser from 'parser/core/CombatLogParser';

import { FallenOrder, TouchOfDeath, FaelineStomp } from '@wowanalyzer/monk';

// Features
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import WeaponsOfOrderWindwalker from './modules/covenants/WeaponsOfOrder';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import JadeIgnition from './modules/items/JadeIgnition';
import LastEmperorsCapacitor from './modules/items/LastEmperorsCapacitor';
// Resources
import ChiDetails from './modules/resources/ChiDetails';
import ChiTracker from './modules/resources/ChiTracker';
import EnergyCapTracker from './modules/resources/EnergyCapTracker';
// Spells
import BlackoutKick from './modules/spells/BlackoutKick';
import ComboBreaker from './modules/spells/ComboBreaker';
import ComboStrikes from './modules/spells/ComboStrikes';
import FistsofFury from './modules/spells/FistsofFury';
import SpinningCraneKick from './modules/spells/SpinningCraneKick';
import TouchOfKarma from './modules/spells/TouchOfKarma';
// Talents
import DanceOfChiJi from './modules/talents/DanceOfChiJi';
import HitCombo from './modules/talents/HitCombo';
import Serenity from './modules/talents/Serenity';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    // Resources
    chiTracker: ChiTracker,
    chiDetails: ChiDetails,
    energyCapTracker: EnergyCapTracker,

    // Talents:
    danceOfChiJi: DanceOfChiJi,
    hitCombo: HitCombo,
    serenity: Serenity,

    // Spells;
    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    touchOfDeath: TouchOfDeath,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,

    // Items:
    lastEmperorsCapacitor: LastEmperorsCapacitor,
    jadeIgnition: JadeIgnition,

    // Covenants
    fallenOrder: FallenOrder,
    weaponsOfOrder: WeaponsOfOrderWindwalker,
    faelineStomp: FaelineStomp,
  };
}

export default CombatLogParser;
