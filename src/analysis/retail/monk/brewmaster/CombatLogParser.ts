import { TouchOfDeath, MysticTouch, DampenHarm } from 'analysis/retail/monk/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Guide from './Guide';
import Abilities from './modules/Abilities';
import AplCheck from './modules/core/AplCheck';
import BrewCDR from './modules/core/BrewCDR';
import DamageTaken from './modules/core/DamageTaken';
import GlobalCooldown from './modules/core/GlobalCooldown';
import HealingDone from './modules/core/HealingDone';
import HealingReceived from './modules/core/HealingReceived';
import SharedBrews from './modules/core/SharedBrews';
import Stagger from './modules/core/Stagger';
import StaggerFabricator from './modules/core/StaggerFabricator';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import StaggerPoolGraph from './modules/features/StaggerPoolGraph';
import { InvokeNiuzao } from './modules/problems/InvokeNiuzao';
import { StompOrderNormalizer } from './modules/problems/InvokeNiuzao/normalizer';
import PurifyingBrewProblems from './modules/problems/PurifyingBrew';
import ScaldingBrew from './modules/talents/ScaldingBrew';
import WalkWithTheOx from './modules/talents/WalkWithTheOx';
import StormtoutsLastKeg from './modules/talents/StormstoutsLastKeg';
import BlackoutCombo from './modules/spells/BlackoutCombo';
import BlackOxBrew from './modules/spells/BlackOxBrew';
import BreathOfFire from './modules/spells/BreathOfFire';
import CelestialBrew from './modules/spells/CelestialBrew';
import CelestialFortune from './modules/spells/CelestialFortune';
import GiftOfTheOxStat from './modules/spells/GiftOfTheOx';
import HighTolerance from './modules/spells/HighTolerance';
import KegSmash from './modules/spells/KegSmash';
import PurifyingBrew from './modules/spells/PurifyingBrew';
import WeaponsOfOrder from './modules/talents/WeaponsOfOrder';
import Shuffle from './modules/spells/Shuffle';
import TigerPalm from './modules/spells/TigerPalm';
import ExpelHarmNorm from './normalizers/ExpelHarm';
import GiftOfTheOx from './normalizers/GiftOfTheOx';
import StaggerLinkNormalizer from './modules/core/StaggerLinkNormalizer';
import CelestialBrewNormalizer from './modules/spells/CelestialBrew/normalizer';
import { ZenMeditation } from './modules/core/MajorDefensives/ZenMeditation';
import { FortifyingBrew } from './modules/core/MajorDefensives/FortifyingBrew';
import { DiffuseMagic } from './modules/core/MajorDefensives/DiffuseMagic';
import DefensiveBuffs from './modules/core/MajorDefensives/DefensiveBuffs';
import DefensiveBuffLinkNormalizer from './modules/core/MajorDefensives/DefensiveBuffLinkNormalizer';
import StaggeringStrikes from './modules/talents/StaggeringStrikes';
import QuickSip from './modules/talents/QuickSip';
import TranquilSpirit from './modules/talents/TranquilSpirit';
import Salsalabims from './modules/talents/Salsalabims';
import AnvilStave from './modules/talents/AnvilStave';
import ChiSurge from './modules/talents/ChiSurge';
import BreathOfFireDebuffTargetNormalizer from './modules/spells/BreathOfFire/normalizer';
import SpinningCraneKickLinkNormalizer from './normalizers/SpinningCraneKick';
import PressTheAdvantage from './modules/talents/PressTheAdvantage';
import PressTheAdvantageNormalizer from './modules/talents/PressTheAdvantage/normalizer';
import WarWithinS1TierSet from './modules/items/WarWithinS1TierSet';
import VeteransEye from '../shared/hero/ShadoPan/VeteransEye';
import WarWithinS2TierSet from './modules/items/WarWithinS2TierSet';
import EfficientTraining from '../shared/hero/ShadoPan/EfficientTraining';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    healingDone: HealingDone,
    healingReceived: HealingReceived,
    damageTaken: DamageTaken,
    stagger: Stagger,
    staggerFabricator: StaggerFabricator,
    brewCdr: BrewCDR,
    brews: SharedBrews,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
    mysticTouch: MysticTouch,
    dampenHarm: DampenHarm,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    staggerPoolGraph: StaggerPoolGraph,

    // Spells
    purifyingBrew: PurifyingBrew,
    celestialBrew: CelestialBrew,
    blackoutCombo: BlackoutCombo,
    kegSmash: KegSmash,
    tigerPalm: TigerPalm,
    bof: BreathOfFire,
    bob: BlackOxBrew,
    highTolerance: HighTolerance,
    cf: CelestialFortune,
    gotox: GiftOfTheOxStat,
    shuffle: Shuffle,
    touchOfDeath: TouchOfDeath,
    zenMed: ZenMeditation,
    fortBrew: FortifyingBrew,
    diffuseMagic: DiffuseMagic,
    defensiveBuffs: DefensiveBuffs,
    defensiveLinks: DefensiveBuffLinkNormalizer,

    // Items
    WarWithinS1TierSet,
    WarWithinS2TierSet,

    // normalizers
    gotoxNorm: GiftOfTheOx,
    ehNorm: ExpelHarmNorm,
    staggerLink: StaggerLinkNormalizer,
    cbNorm: CelestialBrewNormalizer,
    bofNorm: BreathOfFireDebuffTargetNormalizer,
    sckNorm: SpinningCraneKickLinkNormalizer,
    ptaNorm: PressTheAdvantageNormalizer,

    // Talents
    weaponsOfOrder: WeaponsOfOrder,
    scaldingBrew: ScaldingBrew,
    walkWithTheOx: WalkWithTheOx,
    staggeringStrikes: StaggeringStrikes,
    quickSip: QuickSip,
    tranquilSpirit: TranquilSpirit,
    salsalabims: Salsalabims,
    anvilStave: AnvilStave,
    chiSurge: ChiSurge,
    pta: PressTheAdvantage,
    stormstoutsLastKeg: StormtoutsLastKeg,
    veteransEye: VeteransEye,
    efficientTraining: EfficientTraining,

    apl: AplCheck,

    /// Problem/Guide stuff
    purifyProblems: PurifyingBrewProblems,
    invokeNiuzao: InvokeNiuzao,
    stompOrder: StompOrderNormalizer,
  };

  static guide = Guide;
}

export default CombatLogParser;
