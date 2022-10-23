import { BonedustBrew, TouchOfDeath, MysticTouch, DampenHarm } from 'analysis/retail/monk/shared';
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
import RushingJadeWind from './modules/spells/RushingJadeWind';
import WeaponsOfOrder from './modules/talents/WeaponsOfOrder';
import Shuffle from './modules/spells/Shuffle';
import TigerPalm from './modules/spells/TigerPalm';
import ExpelHarmNorm from './normalizers/ExpelHarm';
import GiftOfTheOx from './normalizers/GiftOfTheOx';
import StaggerLinkNormalizer from './modules/core/StaggerLinkNormalizer';

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
    rjw: RushingJadeWind,
    bof: BreathOfFire,
    bob: BlackOxBrew,
    highTolerance: HighTolerance,
    cf: CelestialFortune,
    gotox: GiftOfTheOxStat,
    shuffle: Shuffle,
    touchOfDeath: TouchOfDeath,

    // Items
    stormstoutsLastKeg: StormtoutsLastKeg,

    // normalizers
    gotoxNorm: GiftOfTheOx,
    ehNorm: ExpelHarmNorm,
    staggerLink: StaggerLinkNormalizer,

    // Covenants
    weaponsOfOrder: WeaponsOfOrder,
    bonedustBrew: BonedustBrew,

    // Conduits
    /// Potency
    scaldingBrew: ScaldingBrew,
    walkWithTheOx: WalkWithTheOx,
    /// Finesse

    apl: AplCheck,

    /// Problem/Guide stuff
    purifyProblems: PurifyingBrewProblems,
    invokeNiuzao: InvokeNiuzao,
    stompOrder: StompOrderNormalizer,
  };

  static guide = Guide;
}

export default CombatLogParser;
