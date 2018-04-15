import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import FlamestrikeNormalizer from './Normalizers/Flamestrike';
import Scorch from './Normalizers/Scorch';
import KaelthasUltimateAbility from './Normalizers/KaelthasUltimateAbility';

import Checklist from './Modules/Features/Checklist';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';

import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import UnstableMagic from '../Shared/Modules/Features/UnstableMagic';
import RuneOfPower from '../Shared/Modules/Features/RuneOfPower';
import Kindling from './Modules/Features/Kindling';
import PhoenixsFlames from './Modules/Features/PhoenixsFlames';
import HotStreak from './Modules/Features/HotStreak';
import CombustionFirestarter from './Modules/Features/CombustionFirestarter';
import CombustionCharges from './Modules/Features/CombustionCharges';
import CombustionSpellUsage from './Modules/Features/CombustionSpellUsage';
import CombustionMarqueeBindings from './Modules/Features/CombustionMarqueeBindings';
import HeatingUp from './Modules/Features/HeatingUp';
import Cinderstorm from './Modules/Features/Cinderstorm';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    FlameStrikeNormalizer: FlamestrikeNormalizer,
    scorch: Scorch,
    kaelthasUltimateAbility: KaelthasUltimateAbility,

    //Checklist
    checklist: Checklist,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    cancelledCasts: CancelledCasts,
    phoenixsFlames: PhoenixsFlames,
    hotStreak: HotStreak,
    combustionFirestarter: CombustionFirestarter,
    combustionCharges: CombustionCharges,
    combustionSpellUsage: CombustionSpellUsage,
    combustionMarqueeBindings: CombustionMarqueeBindings,
    heatingUp: HeatingUp,
    cinderstorm: Cinderstorm,

    // Talents
    mirrorImage: MirrorImage,
    unstableMagic: UnstableMagic,
    runeOfPower: [RuneOfPower, { showStatistic: false, showSuggestion: false }],
    kindling: Kindling,
  };
}

export default CombatLogParser;
