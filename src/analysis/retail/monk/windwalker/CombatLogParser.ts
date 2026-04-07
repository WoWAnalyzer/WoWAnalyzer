import { MysticTouch, TouchOfDeath } from 'analysis/retail/monk/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

// Features
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
// import WeaponsOfOrderWindwalker from './modules/covenants/WeaponsOfOrder';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import JadeIgnition from './modules/talents/JadeIgnition';
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
import AplCheck from 'analysis/retail/monk/windwalker/modules/apl/AplCheck';
import { default as DanceOfChiJiNormalizer } from 'analysis/retail/monk/windwalker/modules/core/DanceOfChiJiNormalizer';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import Guide from './Guide';
import ChiBurst from './modules/spells/ChiBurst';
import RisingSunKick from './modules/spells/RisingSunKick';
import StrikeoftheWindlord from './modules/spells/StrikeoftheWindlord';
import DanceOfChiJi from './modules/talents/DanceOfChiJi';
import GloryOfTheDawn from './modules/talents/GloryOfTheDawn';
import HitCombo from './modules/talents/HitCombo';
import HitComboGraph from './modules/talents/HitComboGraph';
import HitComboTracker from './modules/talents/HitComboTracker';
import InvokeXuen from './modules/talents/InvokeXuen';
import Zenith from './modules/talents/Zenith';
import {
  FistsOfFuryLinkNormalizer,
  FistsOfFuryNormalizer,
} from './normalizers/FistsOfFuryNormalizer';
import HeartOfTheJadeSerpent from './modules/spells/HeartOfTheJadeSerpent';
import {
  CracklingJadeLightningLinkNormalizer,
  CracklingJadeLightningNormalizer,
} from './normalizers/CracklingJadeLightningNormalizer';
import ComboBreakerCastLinkNormalizer from './normalizers/ComboBreakerCastLinkNormalizer';
import DanceOfChiJiCastLinkNormalizer from './normalizers/DanceOfChiJiCastLinkNormalizer';
import CelestialConduit from './modules/talents/CelestialConduit';
import CyclonesDrift from './modules/talents/CyclonesDrift';
import SlicingWinds from './modules/spells/SlicingWinds';
import T34ConduitTier from '../shared/hero/ConduitOfTheCelestials/tier/T34Tier';
import VeteransEye from '../shared/hero/ShadoPan/VeteransEye';
import RushingWindKick from './modules/talents/RushingWindKick';
import GloryOfTheDawnLinkNormalizer from './normalizers/GloryOfTheDawnLinkNormalizer';
import RushingWindKickGenerationNormalizer from './normalizers/RushingWindKickGenerationNormalizer';
import RushingWindKickCastLinkNormalizer from './normalizers/RushingWindKickCastLinkNormalizer';
import XuensBattlegearNormalizer from './normalizers/XuensBattlegearNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    mysticTouch: MysticTouch,
    spellUsable: SpellUsable,
    chiJiNormalizer: DanceOfChiJiNormalizer,
    danceOfChiJiLinkNormalizer: DanceOfChiJiCastLinkNormalizer,
    fofNormalizer: FistsOfFuryNormalizer,
    fofLinkNormalizer: FistsOfFuryLinkNormalizer,
    cracklingJadeLightningNormalizer: CracklingJadeLightningNormalizer,
    cracklingJadeLightningLinkNormalizer: CracklingJadeLightningLinkNormalizer,
    comboBreakerLinkNormalizer: ComboBreakerCastLinkNormalizer,
    gloryOfTheDawnLinkNormalizer: GloryOfTheDawnLinkNormalizer,
    rushingWindKickGenerationNormalizer: RushingWindKickGenerationNormalizer,
    rushingWindKickLinkNormalizer: RushingWindKickCastLinkNormalizer,
    xuensBattlegearNormalizer: XuensBattlegearNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Resources
    chiTracker: ChiTracker,
    chiDetails: ChiDetails,
    energyCapTracker: EnergyCapTracker,
    spellChiCost: SpellChiCost,

    // Talents:
    danceOfChiJi: DanceOfChiJi,
    gloryOfTheDawn: GloryOfTheDawn,
    hitCombo: HitCombo,
    strikeoftheWindlord: StrikeoftheWindlord,
    chiBurst: ChiBurst,
    heartOfTheJadeSerpent: HeartOfTheJadeSerpent,
    celestialConduit: CelestialConduit,
    cyclonesDrift: CyclonesDrift,
    veteransEye: VeteransEye,
    zenith: Zenith,
    rushingWindKick: RushingWindKick,

    // Guide helpers
    hitComboTracker: HitComboTracker,
    hitComboGraph: HitComboGraph,

    // Spells;
    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    touchOfDeath: TouchOfDeath,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,
    risingSunKick: RisingSunKick,
    invokeXuen: InvokeXuen,
    slicingWinds: SlicingWinds,

    // Items:
    jadeIgnition: JadeIgnition,
    xuensBattleGear: XuensBattlegear,
    t34ConduitTierSet: T34ConduitTier,

    // apl
    apl: AplCheck,
  };
  static guide = Guide;
}

export default CombatLogParser;
