import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
//Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import FocusUsage from '../shared/modules/resources/FocusUsage';
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
//Focus
import FocusTracker from '../shared/modules/resources/FocusTracker';
import FocusDetails from '../shared/modules/resources/FocusDetails';
import SpellFocusCost from '../shared/modules/resources/SpellFocusCost';
import SurvivalFocusCapTracker from './modules/core/SurvivalFocusCapTracker';
import Focus from './modules/core/Focus';
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

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    abilities: Abilities,
    checklist: Checklist,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    focusUsage: FocusUsage,
    buffs: Buffs,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    survivalFocusCapTracker: SurvivalFocusCapTracker,
    focus: Focus,

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
    /** Wildfire Infusion */
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

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
