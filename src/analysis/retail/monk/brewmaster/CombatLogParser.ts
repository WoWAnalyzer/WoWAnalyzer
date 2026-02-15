import TouchOfDeath from 'analysis/retail/monk/shared/TouchOfDeath';
import MysticTouch from 'analysis/retail/monk/shared/MysticTouch';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Guide from './Guide';
import AplCheck from './modules/core/AplCheck';
import BrewCDR from './modules/core/BrewCDR';
import DamageTaken from './modules/core/DamageTaken';
import HealingDone from './modules/core/HealingDone';
import SharedBrews from './modules/core/SharedBrews';
import Stagger from './modules/core/Stagger';
import StaggerFabricator from './modules/core/StaggerFabricator';
import StaggerPoolGraph from './modules/features/StaggerPoolGraph';
import PurifyingBrewProblems from './modules/problems/PurifyingBrew';
import ScaldingBrew from './modules/talents/ScaldingBrew';
import WalkWithTheOx from './modules/talents/WalkWithTheOx';
import StormtoutsLastKeg from './modules/talents/StormstoutsLastKeg';
import BlackoutCombo from './modules/spells/BlackoutCombo';
import BlackOxBrew from './modules/spells/BlackOxBrew';
import BreathOfFire from './modules/spells/BreathOfFire';
import CelestialBrew from './modules/spells/CelestialBrew';
import GiftOfTheOxStat from './modules/spells/GiftOfTheOx';
import HighTolerance from './modules/spells/HighTolerance';
import KegSmash from './modules/spells/KegSmash';
import PurifyingBrew from './modules/spells/PurifyingBrew';
import Shuffle from './modules/spells/Shuffle';
import TigerPalm from './modules/spells/TigerPalm';
import StaggerLinkNormalizer from './modules/core/StaggerLinkNormalizer';
import CelestialBrewNormalizer from './modules/spells/CelestialBrew/normalizer';
import { FortifyingBrew } from './modules/core/MajorDefensives/FortifyingBrew';
import DefensiveBuffs from './modules/core/MajorDefensives/DefensiveBuffs';
import DefensiveBuffLinkNormalizer from './modules/core/MajorDefensives/DefensiveBuffLinkNormalizer';
import StaggeringStrikes from './modules/talents/StaggeringStrikes';
import QuickSip from './modules/talents/QuickSip';
import TranquilSpirit from './modules/talents/TranquilSpirit';
import Salsalabims from './modules/talents/Salsalabims';
import AnvilStave from './modules/talents/AnvilStave';
import BreathOfFireDebuffTargetNormalizer from './modules/spells/BreathOfFire/normalizer';
import SpinningCraneKickLinkNormalizer from './normalizers/SpinningCraneKick';
import PressTheAdvantage from './modules/talents/PressTheAdvantage';
import PressTheAdvantageNormalizer from './modules/talents/PressTheAdvantage/normalizer';
import VeteransEye from '../shared/hero/ShadoPan/VeteransEye';
import EnergyTracker from './modules/core/EnergyTracker';
import EnergyGraph from './modules/core/EnergyGraph';
import AspectOfHarmony, { AspectOfHarmonyLinkNormalizer } from './modules/talents/AspectOfHarmony';
import { Abilities } from './gen';
import { ExpelOxOrbsNormalizer } from './normalizers/ExpelHarm';
import VitalFlames, { VitalFlameNormalizer } from './modules/talents/VitalFlames';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    healingDone: HealingDone,
    damageTaken: DamageTaken,
    stagger: Stagger,
    staggerFabricator: StaggerFabricator,
    brewCdr: BrewCDR,
    brews: SharedBrews,
    channeling: Channeling,
    EnergyTracker,
    EnergyGraph,
    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
    mysticTouch: MysticTouch,

    // Features
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
    gotox: GiftOfTheOxStat,
    shuffle: Shuffle,
    touchOfDeath: TouchOfDeath,
    fortBrew: FortifyingBrew,
    defensiveBuffs: DefensiveBuffs,
    defensiveLinks: DefensiveBuffLinkNormalizer,

    // Items

    // normalizers
    staggerLink: StaggerLinkNormalizer,
    cbNorm: CelestialBrewNormalizer,
    bofNorm: BreathOfFireDebuffTargetNormalizer,
    sckNorm: SpinningCraneKickLinkNormalizer,
    ptaNorm: PressTheAdvantageNormalizer,
    aohNorm: AspectOfHarmonyLinkNormalizer,
    expelOxOrbNorm: ExpelOxOrbsNormalizer,
    VitalFlameNormalizer,

    // Talents
    scaldingBrew: ScaldingBrew,
    walkWithTheOx: WalkWithTheOx,
    staggeringStrikes: StaggeringStrikes,
    quickSip: QuickSip,
    tranquilSpirit: TranquilSpirit,
    salsalabims: Salsalabims,
    anvilStave: AnvilStave,
    pta: PressTheAdvantage,
    stormstoutsLastKeg: StormtoutsLastKeg,
    veteransEye: VeteransEye,
    AspectOfHarmony,
    VitalFlames,

    apl: AplCheck,

    /// Problem/Guide stuff
    purifyProblems: PurifyingBrewProblems,
  };

  static guide = Guide;
}

export default CombatLogParser;
