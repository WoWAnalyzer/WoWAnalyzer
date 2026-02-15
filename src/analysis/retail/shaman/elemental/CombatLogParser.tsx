import {
  AnkhNormalizer,
  AstralShift,
  EarthShield,
  ElementalBlast,
  SpiritWolf,
  StaticCharge,
} from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import LavaSurge from './modules/core/LavaSurge';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import SubOptimalChainLightning from './modules/features/SubOptimalChainLightning';
import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import Stormkeeper from './modules/talents/Stormkeeper';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import EarthenHarmony from '../restoration/modules/talents/EarthenHarmony';
import ManaSpring from 'analysis/retail/shaman/shared/talents/ManaSpring';
import ElementalGuide from './guide/ElementalGuide';
import SpellMaelstromCost from './modules/core/SpellMaelstromCost';
import MaelstromTracker from './modules/resources/MaelstromTracker';
import MaelstromDetails from './modules/resources/MaelstromDetails';
import MaelstromGraph from './modules/resources/MaelstromGraph';
import EventLinkNormalizer from './modules/normalizers/EventLinkNormalizer';
import CallOfTheAncestors from './modules/hero/farseer/CallOfTheAncestors';
import ElementalPrepullNormalizer from './modules/normalizers/ElementalPrepullNormalizer';
import EventOrderNormalizer from './modules/normalizers/EventOrderNormalizer';
import HeraldOfTheStorms from './modules/talents/HeraldOfTheStorms';
import OfferingFromBeyond from './modules/hero/farseer/OfferingFromBeyond';
import MaelstromSpenders from './modules/features/MaelstromSpenders';
import FlameShock from './modules/core/FlameShock';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    flameShock: FlameShock,
    lavaSurge: LavaSurge,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    subOptimalChainLightning: SubOptimalChainLightning,
    maelstromSpenders: MaelstromSpenders,

    eventLinkNormalizer: EventLinkNormalizer,
    eventOrderNormalizer: EventOrderNormalizer,
    elementalPrepullNormalizer: ElementalPrepullNormalizer,

    // Talents
    aftershock: Aftershock,
    elementalBlast: ElementalBlast,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    elementalOrbit: ElementalOrbit,
    earthenHarmony: EarthenHarmony,
    staticCharge: StaticCharge,
    stormkeeper: Stormkeeper,
    ascendance: Ascendance,
    masterOfTheElements: MasterOfTheElements,
    manaSpring: ManaSpring,
    heraldOfTheStorms: HeraldOfTheStorms,

    // hero talents

    callOfTheAncestors: CallOfTheAncestors,
    offeringFromBeyond: OfferingFromBeyond,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromGraph: MaelstromGraph,
    spellMaelstromCost: SpellMaelstromCost,
    ankhNormalizer: AnkhNormalizer,
    astralShift: AstralShift,
  };

  static guide = ElementalGuide;
}

export default CombatLogParser;
