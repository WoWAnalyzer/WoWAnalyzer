import {
  AnkhNormalizer,
  AstralShift,
  EarthShield,
  EarthenHarmony,
  ElementalBlast,
  NaturesGuardian,
  SpiritWolf,
  StaticCharge,
} from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import ElementalGuide from './guide/ElementalGuide';

// Core
import FlameShock from './modules/core/FlameShock';
import LavaSurge from './modules/core/LavaSurge';
import MaelstromSpenderInfo from './modules/core/MaelstromSpenderInfo';
import SpellMaelstromCost from './modules/core/SpellMaelstromCost';

// Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import MaelstromSpenders from './modules/features/MaelstromSpenders';
import SubOptimalChainLightning from './modules/features/SubOptimalChainLightning';

// Resources
import MaelstromTracker from './modules/resources/MaelstromTracker';
import MaelstromDetails from './modules/resources/MaelstromDetails';
import MaelstromGraph from './modules/resources/MaelstromGraph';

// Talents
import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import ManaSpring from 'analysis/retail/shaman/shared/talents/ManaSpring';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import Stormkeeper from './modules/talents/Stormkeeper';

// Hero Talents
import CallOfTheAncestors from './modules/hero/farseer/CallOfTheAncestors';
import OfferingFromBeyond from './modules/hero/farseer/OfferingFromBeyond';

// Normalizers
import ElementalPrepullNormalizer from './modules/normalizers/ElementalPrepullNormalizer';
import EventLinkNormalizer from './modules/normalizers/EventLinkNormalizer';
import EventOrderNormalizer from './modules/normalizers/EventOrderNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    buffs: Buffs,
    flameShock: FlameShock,
    lavaSurge: LavaSurge,
    maelstromSpenderInfo: MaelstromSpenderInfo,
    spellMaelstromCost: SpellMaelstromCost,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    maelstromSpenders: MaelstromSpenders,
    subOptimalChainLightning: SubOptimalChainLightning,

    // Resources
    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromGraph: MaelstromGraph,

    // Shaman Shared
    ankhNormalizer: AnkhNormalizer,

    // Shaman Class Talents
    astralShift: AstralShift,
    earthShield: EarthShield,
    earthenHarmony: EarthenHarmony,
    elementalOrbit: ElementalOrbit,
    manaSpring: ManaSpring,
    naturesGuardian: NaturesGuardian,
    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,

    // Elemental Talents
    aftershock: Aftershock,
    ascendance: Ascendance,
    elementalBlast: ElementalBlast,
    masterOfTheElements: MasterOfTheElements,
    stormkeeper: Stormkeeper,

    // Hero Talents
    callOfTheAncestors: CallOfTheAncestors,
    offeringFromBeyond: OfferingFromBeyond,

    // Normalizers
    elementalPrepullNormalizer: ElementalPrepullNormalizer,
    eventLinkNormalizer: EventLinkNormalizer,
    eventOrderNormalizer: EventOrderNormalizer,
  };

  static guide = ElementalGuide;
}

export default CombatLogParser;
