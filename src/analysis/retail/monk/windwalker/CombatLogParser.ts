import {
  TouchOfDeath,
  InvokersDelight,
  MysticTouch,
  DampenHarm,
  FaelineStomp,
} from 'analysis/retail/monk/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

// Features
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import GlobalCooldown from './modules/core/GlobalCooldown';
// import WeaponsOfOrderWindwalker from './modules/covenants/WeaponsOfOrder';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MoTCGraph from './modules/features/MoTCGraph';
import JadeIgnition from './modules/talents/JadeIgnition';
import LastEmperorsCapacitor from './modules/talents/LastEmperorsCapacitor';
import XuensBattlegear from './modules/talents/XuensBattlegear';
// Resources
import ChiDetails from './modules/resources/ChiDetails';
import ChiTracker from './modules/resources/ChiTracker';
import EnergyCapTracker from './modules/resources/EnergyCapTracker';
import SpellChiCost from './modules/resources/SpellChiCost';
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
import AplCheck from 'analysis/retail/monk/windwalker/modules/apl/AplCheck';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import DanceOfChiJiNormalizer from 'analysis/retail/monk/windwalker/modules/core/DanceOfChiJiNormalizer';
import CallToDominance from 'parser/retail/modules/items/dragonflight/CallToDominance';
import FistsOfFuryNormalizer from './normalizers/FistsOfFuryNormalizer';

// Tier Set Bonuses
// todo: add t29 tier sets

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    globalCooldown: GlobalCooldown,
    mysticTouch: MysticTouch,
    spellUsable: SpellUsable,
    chiJiNormalizer: DanceOfChiJiNormalizer,
    fofNormalizser: FistsOfFuryNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    moTCGraph: MoTCGraph,

    // Resources
    chiTracker: ChiTracker,
    chiDetails: ChiDetails,
    energyCapTracker: EnergyCapTracker,
    spellChiCost: SpellChiCost,

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
    dampenHarm: DampenHarm,
    faelineStomp: FaelineStomp,

    // Items:
    lastEmperorsCapacitor: LastEmperorsCapacitor,
    invokersDelight: InvokersDelight,
    jadeIgnition: JadeIgnition,
    xuensBattleGear: XuensBattlegear,
    callToDominance: CallToDominance,

    // apl
    apl: AplCheck,
  };
}

export default CombatLogParser;
