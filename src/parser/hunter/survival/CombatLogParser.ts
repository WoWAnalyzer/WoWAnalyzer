import CoreCombatLogParser from 'parser/core/CombatLogParser';

//Overridden Racial
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

//Overridden Core modules
import SpellUsable from './modules/core/SpellUsable';
import GlobalCooldown from './modules/core/GlobalCooldown';

//Features
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';

//Checklist
import Checklist from './modules/checklist/Module';

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
import MarkmansAdvantage from '../shared/modules/spells/conduits/MarkmansAdvantage';
import ResilienceOfTheHunter from '../shared/modules/spells/conduits/ResilienceOfTheHunter';
import ReversalOfFortune from '../shared/modules/spells/conduits/ReversalOfFortune';
import RejuvenatingWind from '../shared/modules/spells/conduits/RejuvenatingWind';
import HarmonyOfTheTortollan from '../shared/modules/spells/conduits/HarmonyOfTheTortollan';

//Legendaries
import NesingwarysTrappingApparatus from './modules/items/NesingwarysTrappingApparatus';
import SoulforgeEmbers from '../shared/modules/items/SoulforgeEmbers';
import WildfireCluster from './modules/items/WildfireCluster';
import LatentPoisonInjectors from './modules/items/LatentPoisonInjectors';
import RylakstalkersConfoundingStrikes from './modules/items/RylakstalkersConfoundingStrikes';
import ButchersBoneFragments from './modules/items/ButchersBoneFragments';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    abilities: Abilities,
    checklist: Checklist,
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,

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
    markmansAdvantage: MarkmansAdvantage,
    resilienceOfTheHunter: ResilienceOfTheHunter,
    reversalOfFortune: ReversalOfFortune,
    rejuvenatingWind: RejuvenatingWind,
    harmonyOfTheTortollan: HarmonyOfTheTortollan,

    //Generic Legendaries
    nesingwarysTrappingApparatus: NesingwarysTrappingApparatus,
    soulforgeEmbers: SoulforgeEmbers,

    //Survival Legendaries
    wildfireCluster: WildfireCluster,
    latentPoisonInjectors: LatentPoisonInjectors,
    rylakstalkersConfoundingStrikes: RylakstalkersConfoundingStrikes,
    butchersBoneFragments: ButchersBoneFragments,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
