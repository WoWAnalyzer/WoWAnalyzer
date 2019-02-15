import React from 'react';

import BaseModule from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';

// Spells
import DemonBite from '../../spells/DemonBite';

// Talents
import Felblade from '../../talents/Felblade';
import DemonicAppetite from '../../talents/DemonicAppetite';
import BlindFury from '../../talents/BlindFury';
import DemonBlades from '../../talents/DemonBlades';
import ImmolationAura from '../../talents/ImmolationAura';
import Momentum from '../../talents/Momentum';

// Fury Resource
import FuryDetails from '../../resourcetracker/FuryDetails';

import Component from './Component';

class Checklist extends BaseModule {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Spells
    demonBite: DemonBite,

    // Talents
    felblade: Felblade,
    demonicAppetite: DemonicAppetite,
    blindFury: BlindFury,
    demonBlades: DemonBlades,
    immolationAura: ImmolationAura,
    momentum: Momentum,

    // Fury Resource
    furyDetails: FuryDetails,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,

          // Spells
          demonBiteFury: this.demonBite.suggestionThresholds,

          // Talents
          felbladeEfficiency: this.felblade.suggestionThresholds,
          demonicAppetiteEfficiency: this.demonicAppetite.suggestionThresholds,
          blindFuryEfficiency: this.blindFury.suggestionThresholds,
          demonBladesEfficiency: this.demonBlades.suggestionThresholds,
          immolationAuraEfficiency: this.immolationAura.suggestionThresholds,
          momentumBuffUptime: this.momentum.suggestionThresholds,
          totalFuryWasted: this.furyDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
