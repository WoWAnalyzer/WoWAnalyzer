import {
  AnkhNormalizer,
  AstralShift,
  FlameShock,
  StaticCharge,
} from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Stormflurry from './modules/talents/Stormflurry';
import HotHand from './modules/talents/HotHand';
import SpiritWolf from 'analysis/retail/shaman/shared/talents/SpiritWolf';
import EarthShield from 'analysis/retail/shaman/shared/talents/EarthShield';
import NaturesGuardian from '../shared/talents/NaturesGuardian';
import ElementalAssault from './modules/talents/ElementalAssault';
import Stormsurge from './modules/spells/Stormsurge';
import FeralSpirit from './modules/talents/FeralSpirit';
import ChainLightning from './modules/talents/ChainLightning';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import EarthenHarmony from '../restoration/modules/talents/EarthenHarmony';
import Guide from './Guide';
import { EventOrderNormalizer } from './modules/normalizers/EventOrderNormalizer';
import SpellUsable from './modules/core/SpellUsable';
import ManaSpring from '../shared/talents/ManaSpring';
import MaelstromWeaponCastNormalizer from './modules/normalizers/MaelstromWeaponCastNormalizer';
import EventLinkNormalizer from './modules/normalizers/EventLinkNormalizer';
import ThorimsInvocation from './modules/talents/ThorimsInvocation';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import AshenCatalyst from './modules/talents/AshenCatalyst';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DoomWinds from './modules/talents/DoomWinds';
import ElementalTempo from './modules/talents/ElementalTempo';
import MaelstromWeaponResourceNormalizer from './modules/normalizers/MaelstromWeaponResourceNormalizer';
import {
  MaelstromWeaponDetails,
  MaelstromWeaponGraph,
  MaelstromWeaponSpenders,
  MaelstromWeaponTracker,
} from './modules/resourcetracker';
import EnhancementRefreshBuffNormalizer from './modules/normalizers/MaelstromRefreshBuffNormalizer';
import StaticAccumulation from './modules/talents/ThunderCapacitor';
import PrimordialStorm from './modules/talents/PrimordialStorm';
import Earthsurge from './modules/hero/totemic/Earthsurge';
import EnchantChecker from './modules/core/EnchantChecker';
import StormUnleashed from './modules/talents/StormUnleashed';

class CombatLogParser extends CoreCombatLogParser {
  static defaultModules = {
    ...CoreCombatLogParser.defaultModules,
    enchantChecker: EnchantChecker,
  };
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
    doomWinds: DoomWinds,
    stormflurry: Stormflurry,
    hotHand: HotHand,
    elementalTempo: ElementalTempo,
    elementalAssault: ElementalAssault,
    feralSpirit: FeralSpirit,
    stormbringer: Stormsurge,
    thorimsInvocation: ThorimsInvocation,
    ashenCatalyst: AshenCatalyst,
    staticAccumulation: StaticAccumulation,
    primordialStorm: PrimordialStorm,
    stormUnleashed: StormUnleashed,

    // hero talents
    reactivity: Earthsurge,

    // Normalizers
    maestromRefreshBuffNormalizer: EnhancementRefreshBuffNormalizer, // removes refresh events following applybuff and applybuffstack
    eventOrderNormalizer: EventOrderNormalizer, // correct events occur out of order
    maelstromWeaponCastNormalizer: MaelstromWeaponCastNormalizer, // links
    eventLinkNormalizer: EventLinkNormalizer, // links various maelstrom casts to damage events, and spells made instant via maelstrom weapon
    maelstromWeaponResourceNormalizer: MaelstromWeaponResourceNormalizer, // converts maelstrom weapon buff stacks into resourchange events and ClassResource costs
  };

  static guide = Guide;
}

export default CombatLogParser;
