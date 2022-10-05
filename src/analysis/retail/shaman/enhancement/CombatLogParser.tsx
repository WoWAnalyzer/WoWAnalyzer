import {
  AnkhNormalizer,
  AstralShift,
  ChainHarvest,
  ElementalConduit,
  FlameShock,
  StaticCharge,
  TumblingWaves,
} from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import WindfuryTotem from './modules/talents/WindfuryTotem';
import MaelstromWeapon from './modules/talents/MaelstromWeapon';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import Stormflurry from './modules/talents/Stormflurry';
import ElementalBlast from 'analysis/retail/shaman/shared/ElementalBlast';
import HotHand from './modules/talents/HotHand';
import IceStrike from './modules/talents/IceStrike';
import SpiritWolf from 'analysis/retail/shaman/shared/talents/SpiritWolf';
import EarthShield from 'analysis/retail/shaman/shared/talents/EarthShield';
import Hailstorm from './modules/talents/Hailstorm';
import FireNova from './modules/talents/FireNova';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import CrashingStorm from './modules/talents/CrashingStorm';
import Sundering from './modules/talents/Sundering';
import ElementalSpirits from './modules/talents/ElementalSpirits';
import ElementalAssault from './modules/talents/ElementalAssault';
import SeedsOfRampantGrowth from './modules/shadowlands/legendaries/SeedsOfRampantGrowth';
import Tier28TwoSet from './modules/shadowlands/tier/Tier28TwoSet';
import Tier28FourSet from 'analysis/retail/paladin/holy/modules/shadowlands/tier/Tier28FourSet';
import Stormbringer from './modules/spells/Stormbringer';
import FeralSpirit from './modules/talents/FeralSpirit';
import ChainLightning from './modules/talents/ChainLightning';
import AplCheck from './modules/apl/AplCheck';
import WitchDoctorsWolfBones from './modules/shadowlands/legendaries/WitchDoctorsWolfBones';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Shaman Shared
    ankhNormalizer: AnkhNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // TODO: Rework below modules

    // Shaman Class Core
    flameShock: FlameShock,

    // Shaman Class Talents
    astralShift: AstralShift,
    earthShield: EarthShield,
    maelstromWeapon: MaelstromWeapon,
    naturesGuardian: NaturesGuardian,
    staticCharge: StaticCharge,
    spiritWolf: SpiritWolf,
    chainLightning: ChainLightning,

    // Enhancement Core

    // Enhancement Core Talents
    windfuryTotem: WindfuryTotem,
    forcefulWinds: ForcefulWinds,
    elementalBlast: ElementalBlast,
    stormflurry: Stormflurry,
    hotHand: HotHand,
    iceStrike: IceStrike,
    elementalAssault: ElementalAssault,
    hailstorm: Hailstorm,
    fireNova: FireNova,
    crashingStorm: CrashingStorm,
    sundering: Sundering,
    elementalSpirits: ElementalSpirits,
    feralSpirit: FeralSpirit,
    stormbringer: Stormbringer,
    // ascendance: Ascendance,
    // lashingFlames: LashingFlames,
    // earthenSpike: EarthenSpike,

    // Covenants
    chainHarvest: ChainHarvest,
    tumblingWaves: TumblingWaves,
    // vesperTotem: VesperTotem,

    // Legendaries
    elementalConduit: ElementalConduit,
    witchDoctorsWolfBones: WitchDoctorsWolfBones,
    seedsOfRampantGrowth: SeedsOfRampantGrowth,

    // Tier
    tier28TwoSet: Tier28TwoSet,
    tier28FourSet: Tier28FourSet,

    // TODO: Rework AplCheck for Dragonflight
    aplCheck: AplCheck,
  };
}

export default CombatLogParser;
