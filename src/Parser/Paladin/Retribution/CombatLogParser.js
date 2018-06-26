import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Haste from './Modules/PaladinCore/Haste';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist';
import Judgment from './Modules/PaladinCore/Judgment';

import DivinePurpose from './Modules/Talents/DivinePurpose';
import ArtOfWar from './Modules/PaladinCore/ArtOfWar';
import Retribution from './Modules/PaladinCore/Retribution';
import Crusade from './Modules/Talents/Crusade';

import HolyPowerTracker from './Modules/HolyPower/HolyPowerTracker';
import HolyPowerDetails from './Modules/HolyPower/HolyPowerDetails';

import WhisperOfTheNathrezim from './Modules/Items/WhisperOfTheNathrezim';
import LiadrinsFuryUnleashed from './Modules/Items/LiadrinsFuryUnleashed';
import SoulOfTheHighlord from './Modules/Items/SoulOfTheHighlord';
import AshesToDust from './Modules/Items/AshesToDust';
import ChainOfThrayn from './Modules/Items/ChainOfThrayn';
import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    haste: Haste,
    // PaladinCore
    damageDone: [DamageDone, { showStatistic: true }],
    artOfWar: ArtOfWar,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    judgment: Judgment,
    retribution: Retribution,
    
    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,

    // Items:
    whisperOfTheNathrezim: WhisperOfTheNathrezim,
    liadrinsFuryUnleahed: LiadrinsFuryUnleashed,
    soulOfTheHighlord: SoulOfTheHighlord,
    ashesToDust: AshesToDust,
    chainOfThrayn: ChainOfThrayn,
    tier20_2set: Tier20_2set,
    tier20_4set: Tier20_4set,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };
}

export default CombatLogParser;
