import { AnkhNormalizer, AstralShift, StaticCharge } from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import FlameShock from './modules/spells/FlameShock';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import WindfuryTotem from './modules/talents/WindfuryTotem';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import Stormflurry from './modules/talents/Stormflurry';
import ElementalBlast from './modules/talents/ElementalBlast';
import HotHand from './modules/talents/HotHand';
import SpiritWolf from 'analysis/retail/shaman/shared/talents/SpiritWolf';
import EarthShield from 'analysis/retail/shaman/shared/talents/EarthShield';
import Hailstorm from './modules/talents/Hailstorm';
import FireNova from './modules/talents/FireNova';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import Sundering from './modules/talents/Sundering';
import ElementalSpirits from './modules/talents/ElementalSpirits';
import ElementalAssault from './modules/talents/ElementalAssault';
import Stormbringer from './modules/spells/Stormbringer';
import FeralSpirit from './modules/talents/FeralSpirit';
import ChainLightning from './modules/talents/ChainLightning';
import AplCheck from './modules/apl/AplCheck';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import EarthenHarmony from '../restoration/modules/talents/EarthenHarmony';
import Guide from './Guide';
import StormBlast from './modules/talents/Stormblast';
import TempestStrikes from './modules/talents/TempestStrikes';
import WitchDoctorsAncestry from './modules/talents/WitchDoctorsAncestry';
import LegacyOfTheFrostWitch from './modules/talents/LegacyOfTheFrostWitch';
import * as Tiers from './modules/dragonflight/TierSets';
import { EventOrderNormalizer } from './modules/normalizers/EventOrderNormalizer';
import SpellUsable from './modules/core/SpellUsable';
import ManaSpring from '../shared/talents/ManaSpring';
import MaelstromWeaponCastNormalizer from './modules/normalizers/MaelstromWeaponCastNormalizer';
import EventLinkNormalizer from './modules/normalizers/EventLinkNormalizer';
import ThorimsInvocation from './modules/talents/ThorimsInvocation';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import CallToDominance from 'parser/retail/modules/items/dragonflight/CallToDominance';
import AshenCatalyst from './modules/talents/AshenCatalyst';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Ascendance from './modules/talents/Ascendance';
import SplinteredElements from '../shared/talents/SplinteredElements';
import SwirlingMaelstrom from './modules/talents/SwirlingMaelstrom';
import MaelstromWeaponBuffNormalizer from './modules/normalizers/MaelstromWeaponBuffNormalizer';
import MaelstromWeaponGeneratorLinkNormalizer from './modules/normalizers/MaelstromWeaponGeneratorLinkNormalizer';
import {
  MaelstromWeaponDetails,
  MaelstromWeaponGraph,
  MaelstromWeaponSpenders,
  MaelstromWeaponTracker,
} from './modules/resourcetracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Shaman Shared
    ankhNormalizer: AnkhNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    checklist: Checklist,

    // Resources
    maelstromWeaponTracker: MaelstromWeaponTracker,
    maelstromWeaponGraph: MaelstromWeaponGraph,
    maelstromWeaponDetails: MaelstromWeaponDetails,
    maelstromWeaponSpenders: MaelstromWeaponSpenders,

    // Shaman Class Core
    flameShock: FlameShock,

    // Shaman Class Talents
    astralShift: AstralShift,
    earthShield: EarthShield,
    elementalOrbit: ElementalOrbit,
    earthenHarmony: EarthenHarmony,
    naturesGuardian: NaturesGuardian,
    staticCharge: StaticCharge,
    spiritWolf: SpiritWolf,
    chainLightning: ChainLightning,
    manaSpring: ManaSpring,

    // Enhancement Core Talents
    ascendance: Ascendance,
    windfuryTotem: WindfuryTotem,
    forcefulWinds: ForcefulWinds,
    elementalBlast: ElementalBlast,
    stormflurry: Stormflurry,
    tempestStrikes: TempestStrikes,
    hotHand: HotHand,
    elementalAssault: ElementalAssault,
    stormBlast: StormBlast,
    hailstorm: Hailstorm,
    fireNova: FireNova,
    sundering: Sundering,
    elementalSpirits: ElementalSpirits,
    witchDoctorsAncestry: WitchDoctorsAncestry,
    feralSpirit: FeralSpirit,
    stormbringer: Stormbringer,
    legacyOfTheFrostWitch: LegacyOfTheFrostWitch,
    thorimsInvocation: ThorimsInvocation,
    ashenCatalyst: AshenCatalyst,
    splinteredElements: SplinteredElements,
    swirlingMaelstrom: SwirlingMaelstrom,

    // Tier
    tier30: Tiers.T30,
    tier31: Tiers.T31,

    // Items
    callToDominance: CallToDominance,

    // Normalizers
    maelstromWeaponBuffNormalizer: MaelstromWeaponBuffNormalizer,
    maelstromWeaponGeneratorLinkNormalizer: MaelstromWeaponGeneratorLinkNormalizer,
    eventLinkNormalizer: EventLinkNormalizer,
    eventOrderNormalizer: EventOrderNormalizer,
    maelstromWeaponCastNormalizer: MaelstromWeaponCastNormalizer,

    aplCheck: AplCheck,
  };

  static guide = Guide;
}

export default CombatLogParser;
