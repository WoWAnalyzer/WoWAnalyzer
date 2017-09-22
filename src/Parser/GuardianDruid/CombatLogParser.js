import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import Cinidaria from 'Parser/Core/Modules/Items/Cinidaria';

import CastEfficiency from './Modules/Features/CastEfficiency';
import DamageTaken from './Modules/Core/DamageTaken';
import DamageDone from './Modules/Core/DamageDone';
import Gore from './Modules/Features/Gore';
import GalacticGuardian from './Modules/Features/GalacticGuardian';
import GuardianOfElune from './Modules/Features/GuardianOfElune';
import IronFurGoEProcs from './Modules/Features/IronFurGoEProcs';
import FrenziedRegenGoEProcs from './Modules/Features/FrenziedRegenGoEProcs';
import RageWasted from './Modules/Features/RageWasted';
import IronFur from './Modules/Spells/IronFur';
import Thrash from './Modules/Spells/Thrash';
import Moonfire from './Modules/Spells/Moonfire';
import Pulverize from './Modules/Spells/Pulverize';
import Earthwarden from './Modules/Talents/Earthwarden';
import FrenziedRegeneration from './Modules/Spells/FrenziedRegeneration';

import DualDetermination from './Modules/Items/DualDetermination';
import SkysecsHold from './Modules/Items/Skysecs';
import LuffaWrappings from './Modules/Items/LuffaWrappings';
import FuryOfNature from './Modules/Items/FuryOfNature';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: DamageTaken,
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: DamageDone,
    abilityTracker: AbilityTracker,
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    goreProcs: Gore,
    galacticGuardianProcs: GalacticGuardian,
    guardianOfEluneProcs: GuardianOfElune,
    ironFurGoEProcs: IronFurGoEProcs,
    frenziedRegenGoEProcs: FrenziedRegenGoEProcs,
    rageWasted: RageWasted,
    ironFur: IronFur,
    thrash: Thrash,
    moonfire: Moonfire,
    pulverize: Pulverize,
    frenziedRegeneration: FrenziedRegeneration,

    // Talents:
    earthwarden: Earthwarden,

    // Legendaries:
    dualDetermination: DualDetermination,
    skysecs: SkysecsHold,
    luffaWrappings: LuffaWrappings,
    furyOfNature: FuryOfNature,
    cinidaria: Cinidaria,
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
            <Talents combatant={this.modules.combatants.selected} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
