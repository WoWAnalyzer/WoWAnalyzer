import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';

import AgonyUptime from './Modules/Features/AgonyUptime';
import CorruptionUptime from './Modules/Features/CorruptionUptime';
import UABuffTracker from './Modules/Features/UABuffTracker';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import DamageDone from './Modules/WarlockCore/DamageDone';
import FatalEchoes from './Modules/WarlockCore/FatalEchoes';

import Haunt from './Modules/Talents/Haunt';
import MaleficGrasp from './Modules/Talents/MaleficGrasp';
import Contagion from './Modules/Talents/Contagion';
import AbsoluteCorruption from './Modules/Talents/AbsoluteCorruption';
import SoulHarvest from './Modules/Talents/SoulHarvest';
import SoulHarvestTalent from './Modules/Talents/SoulHarvestTalent';
import DeathsEmbrace from './Modules/Talents/DeathsEmbrace';
import DeathsEmbraceTalent from './Modules/Talents/DeathsEmbraceTalent';
import SiphonLifeUptime from './Modules/Talents/SiphonLifeUptime';

import TheMasterHarvester from './Modules/Items/Legendaries/TheMasterHarvester';
import StretensSleeplessShackles from './Modules/Items/Legendaries/StretensSleeplessShackles';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';
import PowerCordOfLethtendris from './Modules/Items/Legendaries/PowerCordOfLethtendris';
import SacrolashsDarkStrike from './Modules/Items/Legendaries/SacrolashsDarkStrike';
import ReapAndSow from './Modules/Items/Legendaries/ReapAndSow';

import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier20_4set from './Modules/Items/Tier20_4set';
class CombatLogParser extends MainCombatLogParser {

  static specModules = {
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    uaBuffTracker: UABuffTracker,

    //Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    damageDone: DamageDone,
    fatalEchoes: FatalEchoes,

    //Talents
    haunt: Haunt,
    maleficGrasp: MaleficGrasp,
    contagion: Contagion,
    absoluteCorruption: AbsoluteCorruption,
    soulHarvest: SoulHarvest,
    soulHarvestTalent: SoulHarvestTalent,
    deathsEmbrace: DeathsEmbrace,
    deathsEmbraceTalent: DeathsEmbraceTalent,
    siphonLifeUptime: SiphonLifeUptime,

    //Legendaries
    masterHarvester: TheMasterHarvester,
    stretensSleeplessShackles: StretensSleeplessShackles,
    soulOfTheNetherlord: SoulOfTheNetherlord,
    powerCordOfLethtendris: PowerCordOfLethtendris,
    sacrolashsDarkStrike: SacrolashsDarkStrike,
    reapAndSow: ReapAndSow,
    //Items
    tier20_2set: Tier20_2set,
    tier20_4set: Tier20_4set,
  };

  generateResults() {
    const results = super.generateResults();
    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
