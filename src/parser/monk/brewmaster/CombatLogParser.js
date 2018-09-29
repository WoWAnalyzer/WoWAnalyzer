import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';
// Core
import HealingDone from './modules/core/HealingDone';
import DamageTaken from './modules/core/DamageTaken';
import HealingReceived from './modules/core/HealingReceived';
import Stagger from './modules/core/Stagger';
import BrewCDR from './modules/core/BrewCDR';
import SharedBrews from './modules/core/SharedBrews';
import StaggerFabricator from './modules/core/StaggerFabricator';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Channeling from './modules/core/Channeling';
import MasteryValue from './modules/core/MasteryValue';
// Spells
import IronSkinBrew from './modules/spells/IronSkinBrew';
import PurifyingBrew from './modules/spells/PurifyingBrew';
import BlackoutCombo from './modules/spells/BlackoutCombo';
import KegSmash from './modules/spells/KegSmash';
import TigerPalm from './modules/spells/TigerPalm';
import RushingJadeWind from './modules/spells/RushingJadeWind';
import BreathOfFire from './modules/spells/BreathOfFire';
import BlackOxBrew from './modules/spells/BlackOxBrew';
import HighTolerance from './modules/spells/HighTolerance';
import Guard from './modules/spells/Guard';
// Azerite Traits
import TrainingOfNiuzao from './modules/spells/AzeriteTraits/TrainingOfNiuzao';
import StaggeringStrikes from './modules/spells/AzeriteTraits/StaggeringStrikes';
import ElusiveFootwork from './modules/spells/AzeriteTraits/ElusiveFootwork';
import FitToBurst from './modules/spells/AzeriteTraits/FitToBurst';
// Features
import Checklist from './modules/features/Checklist';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import StaggerPoolGraph from './modules/features/StaggerPoolGraph';
import MitigationCheck from './modules/features/MitigationCheck';

// Items
import T20_2pc from './modules/items/T20_2pc';
import T20_4pc from './modules/items/T20_4pc';
import AnvilHardenedWristwraps from './modules/items/AnvilHardenedWristwraps';
import StormstoutsLastGasp from './modules/items/StormstoutsLastGasp';
import SalsalabimsLostTunic from './modules/items/SalsalabimsLostTunic';
// normalizers
import IronskinBrewNormalizer from './normalizers/IronskinBrew';
import GarothiWorldbreakerMeleeNormalizer from './normalizers/GarothiWorldbreakerMelee';
import GiftOfTheOx from './normalizers/GiftOfTheOx';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    healingDone: [HealingDone, { showStatistic: true }],
    healingReceived: HealingReceived,
    damageTaken: [DamageTaken, { showStatistic: true }],
    stagger: Stagger,
    staggerFabricator: StaggerFabricator,
    damageDone: [DamageDone, { showStatistic: true }],
    brewCdr: BrewCDR,
    brews: SharedBrews,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    masteryValue: MasteryValue,
    mitigationCheck: MitigationCheck,

    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    staggerPoolGraph: StaggerPoolGraph,

    // Spells
    ironSkinBrew: IronSkinBrew,
    purifyingBrew: PurifyingBrew,
    blackoutCombo: BlackoutCombo,
    kegSmash: KegSmash,
    tigerPalm: TigerPalm,
    rjw: RushingJadeWind,
    bof: BreathOfFire,
    bob: BlackOxBrew,
    highTolerance: HighTolerance,
    guard: Guard,

    // Azerite Traits
    trainingOfNiuzao: TrainingOfNiuzao,
    staggeringStrikes: StaggeringStrikes,
    elusiveFootwork: ElusiveFootwork,
    fitToBurst: FitToBurst,

    // Items
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
    ahw: AnvilHardenedWristwraps,
    stormstoutsLastGasp: StormstoutsLastGasp,
    salsalabim: SalsalabimsLostTunic,

    // normalizers
    isbNormalizer: IronskinBrewNormalizer,
    garothi: GarothiWorldbreakerMeleeNormalizer,
    gotox: GiftOfTheOx,
  };
}

export default CombatLogParser;
