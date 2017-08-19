import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';

import DamageTaken from './Modules/Core/DamageTaken';
import HealingDone from './Modules/Core/HealingDone';
import DamageDone from './Modules/Core/DamageDone';
import Gore from './Modules/Features/Gore';
import GalacticGuardian from './Modules/Features/GalacticGuardian';
import GuardianOfElune from './Modules/Features/GuardianOfElune';
import IronFurGoEProcs from './Modules/Features/IronFurGoEProcs';
import FrenziedRegenGoEProcs from './Modules/Features/FrenziedRegenGoEProcs';
import IronFur from './Modules/Spells/IronFur';
import Thrash from './Modules/Spells/Thrash';
import Moonfire from './Modules/Spells/Moonfire';
import Pulverize from './Modules/Spells/Pulverize';
import DualDetermination from './Modules/Items/DualDetermination';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    //Core 
    damageTaken: DamageTaken,
    healingDone: HealingDone,
    damageDone: DamageDone,
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    goreProcs: Gore,
    galacticGuardianProcs: GalacticGuardian,
    guardianOfEluneProcs: GuardianOfElune,
    ironFurGoEProcs: IronFurGoEProcs,
    frenziedRegenGoEProcs: FrenziedRegenGoEProcs,
    ironFur: IronFur,
    thrash: Thrash,
    moonfire: Moonfire,
    pulverize: Pulverize,
    
    // Legendaries:
    dualDetermination: DualDetermination,
  };

  damageBySchool = {};
  totalOverkill = 0;
  on_toPlayer_damage(event) {
    if (this.damageBySchool[event.ability.type] === undefined) {
      this.damageBySchool[event.ability.type] = 0;
    }
    this.damageBySchool[event.ability.type] += event.amount + (event.absorbed || 0) + (event.overkill || 0);
    // Unsure at this point if this should be added to the super class total, keeping seperate for now...
    this.totalOverkill += event.overkill || 0;
    super.on_toPlayer_damage(event);
  }

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
