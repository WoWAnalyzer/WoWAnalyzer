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
import BladeofJustice from 'analysis/retail/paladin/retribution/modules/talents/BladeofJustice';
import HammerofWrathRetribution from 'analysis/retail/paladin/retribution/modules/talents/HammerofWrath';
import ShieldOfVengeance from 'analysis/retail/paladin/retribution/modules/talents/ShieldOfVengeance';
import WakeofAshes from 'analysis/retail/paladin/retribution/modules/talents/WakeofAshes';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FinalVerdict from 'analysis/retail/paladin/retribution/modules/talents/FinalVerdict';
import ZealousPyreknightsArdorEventLinkNormalizer from 'analysis/retail/paladin/retribution/modules/dragonflight/ZealousPyreknightsArdor/ZealousPyreknightsArdorEventLinkNormalizer';
import ZealousPyreknightsArdorEchoesOfWrathNormalizer from 'analysis/retail/paladin/retribution/modules/dragonflight/ZealousPyreknightsArdor/ZealousPyreknightsArdorEchoesOfWrathNormalizer';
import BuilderUse from 'analysis/retail/paladin/retribution/modules/core/BuilderUse';
import CrusaderStrike from 'analysis/retail/paladin/retribution/modules/core/CrusaderStrike';
import Crusade from 'analysis/retail/paladin/retribution/modules/talents/Crusade';
import Consecration from 'analysis/retail/paladin/retribution/modules/core/Consecration';
import EmpyreanPower from 'analysis/retail/paladin/retribution/modules/talents/EmpyreanPower';
import ZealousPyreknightsArdor2p from 'analysis/retail/paladin/retribution/modules/dragonflight/ZealousPyreknightsArdor/ZealousPyreknightsArdor2p';
import ZealousPyreknightsArdor4p from 'analysis/retail/paladin/retribution/modules/dragonflight/ZealousPyreknightsArdor/ZealousPyreknightsArdor4p';
import Guide from './Guide';

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

    // Normalizers (order matters)
    zealousPyreknightsArdorEchoesOfWrathNormalizer: ZealousPyreknightsArdorEchoesOfWrathNormalizer,
    zealousPyreknightsArdorEventLinkNormalizer: ZealousPyreknightsArdorEventLinkNormalizer,

    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    wakeofAshes: WakeofAshes,
    consecration: Consecration,
    hammerofWrathRetribution: HammerofWrathRetribution,
    empyreanPower: EmpyreanPower,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,

    // Items
    finalVerdict: FinalVerdict,

    // Tier Set
    zealousPyreknightsArdor2p: ZealousPyreknightsArdor2p,
    zealousPyreknightsArdor4p: ZealousPyreknightsArdor4p,
  };
}

export default CombatLogParser;
