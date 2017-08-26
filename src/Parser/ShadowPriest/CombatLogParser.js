import React from 'react';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
// import Tab from 'Main/Tab';
// import Talents from 'Main/Talents';

import { formatNumber } from 'common/format';



import AbilityTracker from './Modules/Core/AbilityTracker';
import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import DamageDone from './Modules/Core/DamageDone';


import Mindbender from './Modules/Spells/Mindbender';
import VampiricTouch from './Modules/Spells/VampiricTouch';
import ShadowWordPain from './Modules/Spells/ShadowWordPain';
import Voidform from './Modules/Spells/Voidform';
import VoidTorrent from './Modules/Spells/VoidTorrent';
import Dispersion from './Modules/Spells/Dispersion';
import CallToTheVoid from './Modules/Spells/CallToTheVoid';



class CombatLogParser extends MainCombatLogParser {

  static specModules = {
    damageDone: DamageDone,
    alwaysBeCasting: AlwaysBeCasting,
    abilityTracker: AbilityTracker,
    castEfficiency: CastEfficiency,

    // Abilities
    mindbender: Mindbender,
    vampiricTouch: VampiricTouch,
    shadowWordPain: ShadowWordPain,
    voidform: Voidform,
    voidTorrent: VoidTorrent,
    dispersion: Dispersion,
    callToTheVoid: CallToTheVoid,
  };

  generateResults() {
    const results = super.generateResults();

    const {
      voidformAverageDuration,
      lastVoidformWasExcluded,
    } = this.modules.voidform;

    results.statistics = [
      ...results.statistics,

      <StatisticBox
        icon={<SpellIcon id={SPELLS.VOIDFORM.id} />}
        value={`${formatNumber(voidformAverageDuration)} stacks`}
        label={(
          <dfn data-tip={`The average stacks of your voidforms.${lastVoidformWasExcluded ? 'The last voidform of the fight was excluded since it skewed the average.' : ''}`}>
            Average voidform
          </dfn>
        )}
      />,
    ];

    results.items = [
      ...results.items,
    ];

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      ...results.tabs,
      // {
      //   title: 'Talents',
      //   url: 'talents',
      //   render: () => (
      //     <Tab title="Talents">
      //       <Talents combatant={this.selectedCombatant} />
      //     </Tab>
      //   ),
      // },
    ];

    return results;
  }
}

export default CombatLogParser;
