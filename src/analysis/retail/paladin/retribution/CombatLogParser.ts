import {
  DivinePurpose,
  HolyPowerDetails,
  HolyPowerPerMinute,
  HolyPowerTracker,
  Judgment,
} from 'analysis/retail/paladin/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import ArtOfWar from 'analysis/retail/paladin/retribution/modules/talents/ArtOfWar';
import ArtOfWarProbability from 'analysis/retail/paladin/retribution/modules/talents/ArtOfWarProbability';
import BladeOfJustice from 'analysis/retail/paladin/retribution/modules/talents/BladeOfJustice';
import CrusaderStrike from './modules/core/CrusaderStrike';
import HammerofWrathRetribution from 'analysis/retail/paladin/retribution/modules/talents/HammerofWrath';
import ShieldOfVengeance from 'analysis/retail/paladin/retribution/modules/talents/ShieldOfVengeance';
import WakeOfAshes from 'analysis/retail/paladin/retribution/modules/talents/WakeOfAshes';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FinalVerdict from 'analysis/retail/paladin/retribution/modules/talents/FinalVerdict';
import Crusade from './modules/talents/Crusade';
import EmpyreanPower from './modules/talents/EmpyreanPower';
import BuilderUse from './modules/core/BuilderUse';
import Guide from './Guide';
import { MeleeUptimeAnalyzer } from 'interface/guide/foundation/analyzers/MeleeUptimeAnalyzer';
import SPELLS from 'common/SPELLS';
import Expurgation from './modules/talents/Expurgation';
import WakeOfAshesNormalizer from './normalizers/WakeOfAshesNormalizer';
import ExecutionSentence from './modules/talents/ExecutionSentence';
import Lightbearer from '../shared/Lightbearer';
import InstrumentOfRetribution from './modules/core/InstrumentOfRetribution';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;

  static specModules = {
    // Core
    builderUse: BuilderUse,

    instrumentOfRetribution: InstrumentOfRetribution,
    artOfWar: ArtOfWar,
    artOfWarProbability: ArtOfWarProbability,

    // Normalizers
    wakeOfAshesNormalizer: WakeOfAshesNormalizer,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    bladeofJustice: BladeOfJustice,
    crusaderStrike: CrusaderStrike,
    shieldOfVengeance: ShieldOfVengeance,
    judgment: Judgment,

    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    wakeofAshes: WakeOfAshes,
    hammerofWrathRetribution: HammerofWrathRetribution,
    empyreanPower: EmpyreanPower,
    expurgation: Expurgation,
    executionSentence: ExecutionSentence,
    lightBearer: Lightbearer,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,

    // Items
    finalVerdict: FinalVerdict,

    meleeUptime: MeleeUptimeAnalyzer.withMeleeAbility(SPELLS.CRUSADING_STRIKES),
  };
}

export default CombatLogParser;
