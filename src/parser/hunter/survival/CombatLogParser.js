import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Abilities from './modules/Abilities';
//Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import TimeFocusCapped from '../shared/modules/features/TimeFocusCapped';
import FocusUsage from '../shared/modules/features/FocusUsage';
//Normalizer
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';
//Focus
import FocusTracker from '../shared/modules/features/focuschart/FocusTracker';
import FocusTab from '../shared/modules/features/focuschart/FocusTab';
//Spells
import KillCommand from './modules/spells/KillCommand';
import ButcheryCarve from './modules/spells/ButcheryCarve';
import SerpentSting from './modules/spells/SerpentSting';
import CoordinatedAssault from './modules/spells/CoordinatedAssault';
import WildfireBomb from './modules/spells/WildfireBomb';
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
//Traits and Talents
import SpellsAndTalents from './modules/features/SpellsAndTalents';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    timeFocusCapped: TimeFocusCapped,
    focusUsage: FocusUsage,

    //Normalizers
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Spells
    killCommand: KillCommand,
    butcheryCarve: ButcheryCarve,
    serpentSting: SerpentSting,
    coordinatedAssault: CoordinatedAssault,
    wildfireBomb: WildfireBomb,

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

    //Traits and talents
    traitsAndTalents: SpellsAndTalents,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }],
  };
}

export default CombatLogParser;
