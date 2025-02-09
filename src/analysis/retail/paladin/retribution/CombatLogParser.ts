import {
  DivinePurpose,
  DuskAndDawn,
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
import BladeofJustice from 'analysis/retail/paladin/retribution/modules/talents/BladeofJustice';
import Consecration from './modules/core/Consecration';
import CrusaderStrike from './modules/core/CrusaderStrike';
import HammerofWrathRetribution from 'analysis/retail/paladin/retribution/modules/talents/HammerofWrath';
import ShieldOfVengeance from 'analysis/retail/paladin/retribution/modules/talents/ShieldOfVengeance';
import WakeofAshes from 'analysis/retail/paladin/retribution/modules/talents/WakeofAshes';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FinalVerdict from 'analysis/retail/paladin/retribution/modules/talents/FinalVerdict';
import Crusade from './modules/talents/Crusade';
import EmpyreanPower from './modules/talents/EmpyreanPower';
import BuilderUse from './modules/core/BuilderUse';
import Guide from './Guide';
import { MeleeUptimeAnalyzer } from 'interface/guide/foundation/analyzers/MeleeUptimeAnalyzer';
import SPELLS from 'common/SPELLS';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;

  static specModules = {
    // Core
    builderUse: BuilderUse,

    artOfWar: ArtOfWar,
    artOfWarProbability: ArtOfWarProbability,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    bladeofJustice: BladeofJustice,
    crusaderStrike: CrusaderStrike,
    shieldOfVengeance: ShieldOfVengeance,
    judgment: Judgment,

    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    wakeofAshes: WakeofAshes,
    consecration: Consecration,
    hammerofWrathRetribution: HammerofWrathRetribution,
    empyreanPower: EmpyreanPower,
    duskAndDawn: DuskAndDawn,

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
