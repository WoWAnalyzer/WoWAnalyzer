import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Abilities from './modules/features/Abilities';
import LivingFlame from '../shared/modules/core/LivingFlame';
import DreamBreath from './modules/talents/DreamBreath';
import MasteryEffectiveness from './modules/core/MasteryEffectiveness';
import Spiritbloom from './modules/talents/Spiritbloom';
import HotAttributor from './modules/core/HotAttributor';
import HotTrackerPrevoker from './modules/core/HotTrackerPrevoker';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';

import Checklist from 'analysis/retail/evoker/preservation/modules/features/Checklist/Module';
import EssenceDetails from './modules/features/EssenceDetails';
import GracePeriod from './modules/talents/GracePeriod';
import Reversion from './modules/talents/Reversion';
import CallOfYsera from './modules/talents/CallOfYsera';
import EssenceBurst, { EssenceBurstSources } from './modules/talents/EssenceBurst';
import EmeraldBlossom from './modules/talents/EmeraldBlossom';
import Echo from './modules/talents/Echo';
import ResonatingSphere from './modules/talents/ResonatingSphere';
import CycleOfLife from './modules/talents/CycleOfLife';
import TimeLord from './modules/talents/TimeLord';
import RenewingBreath from './modules/talents/RenewingBreath';
import FieldOfDreams from './modules/talents/FieldOfDreams';
import DreamFlight from './modules/talents/DreamFlight';
import ExhilBurst from './modules/talents/ExhilBurst';
import Stasis from './modules/talents/Stasis';
import TimeOfNeed from './modules/talents/TimeOfNeed';
import Lifebind from './modules/talents/Lifebind';
import EnergyLoop from './modules/talents/EnergyLoop';
import AlwaysBeCasting from './modules/core/AlwaysBeCasting';
import FontOfMagic from './modules/talents/FontOfMagic';
import EmeraldCommunion from './modules/talents/EmeraldCommunion';
import SparkOfInsight from './modules/talents/SparkOfInsight';
import EchoBreakdown from './modules/talents/EchoBreakdown';
import Ouroboros from './modules/talents/Ouroboros';
import T30PrevokerSet from './modules/dragonflight/tier/T30TierSet';
import Guide from 'analysis/retail/evoker/preservation/Guide';
import NozTeachings from './modules/talents/NozTeachings';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import RegenerativeMagic from '../shared/modules/talents/RegenerativeMagic';
import AncientFlame from './modules/talents/AncientFlame';
import T31PrevokerSet from './modules/dragonflight/tier/T31TierSet';
import EchoTypeBreakdown from './modules/talents/EchoTypeBreakdown';
import {
  LivingFlameNormalizer,
  LivingFlamePrePullNormalizer,
  LeapingFlamesNormalizer,
  LeapingFlames,
  EmpowerNormalizer,
  SpellUsable,
  SpellEssenceCost,
  EssenceTracker,
  SourceOfMagic,
  PotentMana,
} from '../shared';
import EBRefreshNormalizer from './normalizers/EBRefreshNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    cooldowns: CooldownThroughputTracker,

    // Normalizer
    ebRefreshNormalizer: EBRefreshNormalizer,
    livingFlameNormalizer: LivingFlameNormalizer,
    castLinkNormalizer: CastLinkNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotRemovalNormalizer: HotRemovalNormalizer,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    //resources
    essenceTracker: EssenceTracker,
    essenceDetails: EssenceDetails,
    spellEssenceCost: SpellEssenceCost,
    manaTracker: ManaTracker,

    //features
    checklist: Checklist,

    //core
    alwaysBeCasting: AlwaysBeCasting,
    hotTrackerPrevoker: HotTrackerPrevoker,
    hotAttributor: HotAttributor,

    // Shared talents
    livingFlamePrePullNormalizer: LivingFlamePrePullNormalizer,
    leapingFlamesNormalizer: LeapingFlamesNormalizer,
    leapingFlames: LeapingFlames,
    sourceOfMagic: SourceOfMagic,
    potentMana: PotentMana,
    // Empower Normalizer
    empowerNormalizer: EmpowerNormalizer,
    spellUsable: SpellUsable,

    //talents
    ancientFlame: AncientFlame,
    echo: Echo,
    echoBreakdown: EchoBreakdown,
    dreamBreath: DreamBreath,
    dreamFlight: DreamFlight,
    livingFlame: LivingFlame,
    masteryEffectiveness: MasteryEffectiveness,
    spiritBloom: Spiritbloom,
    gracePeriod: GracePeriod,
    reversion: Reversion,
    callOfYsera: CallOfYsera,
    essenceBurst: EssenceBurst,
    emeraldBlossom: EmeraldBlossom,
    resonatingSphere: ResonatingSphere,
    cycleOfLife: CycleOfLife,
    timeLord: TimeLord,
    renewingBreath: RenewingBreath,
    fieldOfDreams: FieldOfDreams,
    exhilBurst: ExhilBurst,
    stasis: Stasis,
    timeOfNeed: TimeOfNeed,
    lifebind: Lifebind,
    energyLoop: EnergyLoop,
    fontOfMagic: FontOfMagic,
    emeraldCommunion: EmeraldCommunion,
    sparkOfInsight: SparkOfInsight,
    ouroboros: Ouroboros,
    nozTeachings: NozTeachings,
    regenerativeMagic: RegenerativeMagic,
    echoTypeBreakdown: EchoTypeBreakdown,
    essenceBurstSources: EssenceBurstSources,

    // tier
    t30PrevokerTier: T30PrevokerSet,
    t31PrevokerTIer: T31PrevokerSet,
  };
  static guide = Guide;
}

export default CombatLogParser;
