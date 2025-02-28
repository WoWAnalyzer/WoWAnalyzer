import {
  AnkhNormalizer,
  AstralShift,
  EarthShield,
  ElementalBlast,
  FlameShock,
  SpiritWolf,
  StaticCharge,
} from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import LavaSurge from './modules/core/LavaSurge';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import SubOptimalChainLightning from './modules/features/SubOptimalChainLightning';
import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import PrimalFireElemental from './modules/talents/PrimalFireElemental';
import PrimalStormElemental from './modules/talents/PrimalStormElemental';
import Stormkeeper from './modules/talents/Stormkeeper';
import SurgeOfPower from './modules/talents/SurgeOfPower';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import EarthenHarmony from '../restoration/modules/talents/EarthenHarmony';
import ManaSpring from 'analysis/retail/shaman/shared/talents/ManaSpring';
import ElementalGuide from './guide/ElementalGuide';
import SpellMaelstromCost from './modules/core/SpellMaelstromCost';
import SpenderWindow from './modules/features/SpenderWindow';
import MaelstromTracker from './modules/resources/MaelstromTracker';
import MaelstromDetails from './modules/resources/MaelstromDetails';
import MaelstromGraph from './modules/resources/MaelstromGraph';
import { StormbringerTab } from '../shared/hero/stormbringer/StormbringerTab';
import Tempest from '../shared/hero/stormbringer/Tempest';
import StormbringerEventOrderNormalizer from '../shared/hero/stormbringer/normalizers/StormbringerEventOrderNormalizer';
import StormbringerEventLinkNormalizer from '../shared/hero/stormbringer/normalizers/StormbringerEventLinkNormalizer';
import EventLinkNormalizer from './modules/normalizers/EventLinkNormalizer';
import CallOfTheAncestors from './modules/hero/farseer/CallOfTheAncestors';
import ElementalPrepullNormalizer from './modules/normalizers/ElementalPrepullNormalizer';
import EventOrderNormalizer from './modules/normalizers/EventOrderNormalizer';
import HeraldOfTheStorms from './modules/talents/HeraldOfTheStorms';
import EchoesOfGreatSundering from './modules/talents/EchoesOfGreatSundering';
import OfferingFromBeyond from './modules/hero/farseer/OfferingFromBeyond';
import FusionOfElementsNormalizer from './modules/normalizers/FusionOfElementsNormalizer';
import MaelstromSpenders from './modules/features/MaelstromSpenders';
import FusionOfElements from './modules/talents/FusionOfElements';

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
    spenderWindow: SpenderWindow,
    maelstromSpenders: MaelstromSpenders,

    eventLinkNormalizer: EventLinkNormalizer,
    eventOrderNormalizer: EventOrderNormalizer,
    elementalPrepullNormalizer: ElementalPrepullNormalizer,
    fusionOfElementsNormalizer: FusionOfElementsNormalizer,

    // Talents
    aftershock: Aftershock,
    elementalBlast: ElementalBlast,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    elementalOrbit: ElementalOrbit,
    earthenHarmony: EarthenHarmony,
    staticCharge: StaticCharge,
    masterOfTheElements: MasterOfTheElements,
    surgeOfPower: SurgeOfPower,
    primalFireElemental: PrimalFireElemental,
    primalStormElemental: PrimalStormElemental,
    stormkeeper: Stormkeeper,
    ascendance: Ascendance,
    manaSpring: ManaSpring,
    heraldOfTheStorms: HeraldOfTheStorms,
    echoesOfGreatSundering: EchoesOfGreatSundering,
    fusionOfElements: FusionOfElements,

    // hero talents
    stormbringerTab: StormbringerTab,
    tempest: Tempest,
    stormbringerEventOrderNormalizer: StormbringerEventOrderNormalizer,
    stormbringerEventLinkNormalizer: StormbringerEventLinkNormalizer,

    callOfTheAncestors: CallOfTheAncestors,
    offeringFromBeyond: OfferingFromBeyond,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromGraph: MaelstromGraph,
    spellMaelstromCost: SpellMaelstromCost,
    ankhNormalizer: AnkhNormalizer,
    checklist: Checklist,
    astralShift: AstralShift,
  };

  static guide = ElementalGuide;
}

export default CombatLogParser;
