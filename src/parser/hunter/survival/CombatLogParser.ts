import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';

//Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';

//Normalizer
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';

//Death Tracker
import DeathTracker from '../shared/modules/core/DeathTracker';

//Spells
import KillCommand from './modules/spells/KillCommand';
import ButcheryCarve from './modules/spells/ButcheryCarve';
import SerpentSting from './modules/spells/SerpentSting';
import CoordinatedAssault from './modules/spells/CoordinatedAssault';
import WildfireBomb from './modules/spells/WildfireBomb';
import RaptorStrike from './modules/spells/RaptorStrike';
import HuntersMark from '../shared/modules/spells/HuntersMark';
import KillShot from '../shared/modules/spells/KillShot';

//Focus
import FocusTracker from '../shared/modules/resources/FocusTracker';
import FocusDetails from '../shared/modules/resources/FocusDetails';
import SpellFocusCost from '../shared/modules/resources/SpellFocusCost';
import SurvivalFocusCapTracker from './modules/resources/SurvivalFocusCapTracker';
import Focus from './modules/resources/Focus';
import SurvivalFocusUsage from './modules/resources/SurvivalFocusUsage';

//Talents
import Trailblazer from '../shared/modules/talents/Trailblazer';
import NaturalMending from '../shared/modules/talents/NaturalMending';
import AMurderOfCrows from '../shared/modules/talents/AMurderOfCrows';
import VipersVenom from './modules/talents/VipersVenom';
import MongooseBite from './modules/talents/MongooseBite';
import GuerrillaTactics from './modules/talents/GuerrillaTactics';
import SteelTrap from './modules/talents/SteelTrap';
import Chakrams from './modules/talents/Chakrams';
import BirdOfPrey from './modules/talents/BirdOfPrey';
import BornToBeWild from '../shared/modules/talents/BornToBeWild';
import BindingShot from '../shared/modules/talents/BindingShot';
import PheromoneBomb from './modules/talents/WildfireInfusion/PheromoneBomb';
import ShrapnelBomb from './modules/talents/WildfireInfusion/ShrapnelBomb';
import VolatileBomb from './modules/talents/WildfireInfusion/VolatileBomb';
import AlphaPredator from './modules/talents/AlphaPredator';
import Bloodseeker from './modules/talents/Bloodseeker';
import HydrasBite from './modules/talents/HydrasBite';
import FlankingStrike from './modules/talents/FlankingStrike';
import TipOfTheSpear from './modules/talents/TipOfTheSpear';

//Azerite Traits
import WildernessSurvival from './modules/spells/azeritetraits/WildernessSurvival';
import LatentPoison from './modules/spells/azeritetraits/LatentPoison';
import BlurOfTalons from './modules/spells/azeritetraits/BlurOfTalons';
import PrimevalIntuition from './modules/spells/azeritetraits/PrimevalIntuition';
import DireConsequences from '../shared/modules/spells/azeritetraits/DireConsequences';
import WildfireCluster from './modules/spells/azeritetraits/WildfireCluster';

//Azerite Essences
import MemoryOfLucidDreams from './modules/items/MemoryOfLucidDreams';

//Covenants
import ResonatingArrow from '../shared/modules/spells/covenants/kyrian/ResonatingArrow';
import DeathChakrams from '../shared/modules/spells/covenants/necrolord/DeathChakrams';
import WildSpirits from '../shared/modules/spells/covenants/nightfae/WildSpirits';
import FlayedShot from '../shared/modules/spells/covenants/venthyr/FlayedShot';

//Conduits
import EnfeebledMark from '../shared/modules/spells/conduits/kyrian/EnfeebledMark';
import EmpoweredRelease from '../shared/modules/spells/conduits/venthyr/EmpoweredRelease';
import NecroticBarrage from '../shared/modules/spells/conduits/necrolord/NecroticBarrage';
import SpiritAttunement from '../shared/modules/spells/conduits/nightfae/SpiritAttunement';
import DeadlyTandem from './modules/spells/conduits/DeadlyTandem';
import FlameInfusion from './modules/spells/conduits/FlameInfusion';
import StingingStrike from './modules/spells/conduits/StingingStrike';
import StrengthOfThePack from './modules/spells/conduits/StrengthOfThePack';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    abilities: Abilities,
    checklist: Checklist,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    buffs: Buffs,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    survivalFocusCapTracker: SurvivalFocusCapTracker,
    focus: Focus,
    survivalFocusUsage: SurvivalFocusUsage,

    //Normalizers
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    killCommand: KillCommand,
    butcheryCarve: ButcheryCarve,
    serpentSting: SerpentSting,
    coordinatedAssault: CoordinatedAssault,
    wildfireBomb: WildfireBomb,
    raptorStrike: RaptorStrike,
    huntersMark: HuntersMark,
    killShot: KillShot,

    //Talents
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    aMurderOfCrows: AMurderOfCrows,
    vipersVenom: VipersVenom,
    mongooseBite: MongooseBite,
    steelTrap: SteelTrap,
    guerrillaTactics: GuerrillaTactics,
    chakrams: Chakrams,
    birdOfPrey: BirdOfPrey,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    alphaPredator: AlphaPredator,
    bloodseeker: Bloodseeker,
    hydrasBite: HydrasBite,
    flankingStrike: FlankingStrike,
    tipOfTheSpear: TipOfTheSpear,
    pheromoneBomb: PheromoneBomb,
    shrapnelBomb: ShrapnelBomb,
    volatileBomb: VolatileBomb,

    //Azerite Traits
    wildernessSurvival: WildernessSurvival,
    latentPoison: LatentPoison,
    blurOfTalons: BlurOfTalons,
    primevalIntuition: PrimevalIntuition,
    direConsequences: DireConsequences,
    wildfireCluster: WildfireCluster,

    //Azerite Essences
    memoryOfLucidDreams: MemoryOfLucidDreams,

    //Covenants
    resonatingArrow: ResonatingArrow,
    deathChakrams: DeathChakrams,
    wildSpirits: WildSpirits,
    flayedShot: FlayedShot,

    //Conduits
    empoweredRelease: EmpoweredRelease,
    enfeebledMark: EnfeebledMark,
    necroticBarrage: NecroticBarrage,
    spiritAttunement: SpiritAttunement,
    deadlyTandem: DeadlyTandem,
    flameInfusion: FlameInfusion,
    stingingStrike: StingingStrike,
    strengthOfThePack: StrengthOfThePack,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
