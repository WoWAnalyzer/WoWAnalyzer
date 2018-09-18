import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

// Buffs-Debuffs
import SpiritBombFrailtyDebuff from '../../Talents/SpiritBombFrailtyDebuff';
import VoidReaverDebuff from '../../Talents/VoidReaverDebuff';

// Talents
import SpiritBombSoulsConsume from '../../Talents/SpiritBombSoulsConsume';
import SoulBarrier from '../../Talents/SoulBarrier';

//Spells
import SoulCleaveSoulsConsumed from '../../Spells/SoulCleaveSoulsConsumed';

// Resources
import PainDetails from '../../Pain/PainDetails';
import SoulsOvercap from '../../Statistics/SoulsOvercap';

import AlwaysBeCasting from '../AlwaysBeCasting';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Buffs-Debuffs
    spiritBombFrailtyDebuff: SpiritBombFrailtyDebuff,
    voidReaverDebuff: VoidReaverDebuff,

    // Talents
    spiritBombSoulsConsume: SpiritBombSoulsConsume,
    soulBarrier: SoulBarrier,

    // Spells
    soulCleaveSoulsConsumed: SoulCleaveSoulsConsumed,

    // Resources
    painDetails: PainDetails,
    soulsOvercap: SoulsOvercap,

  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          spiritBombFrailtyDebuff: this.spiritBombFrailtyDebuff.uptimeSuggestionThresholds,
          voidReaverDebuff: this.voidReaverDebuff.uptimeSuggestionThresholds,
          spiritBombSoulsConsume: this.spiritBombSoulsConsume.suggestionThresholdsEfficiency,
          soulBarrier: this.soulBarrier.suggestionThresholdsEfficiency,
          soulCleaveSoulsConsumed: this.soulCleaveSoulsConsumed.suggestionThresholdsEfficiency,
          painDetails: this.painDetails.suggestionThresholds,
          soulsOvercap: this.soulsOvercap.suggestionThresholdsEfficiency,
        }}
      />
    );
  }
}

export default Checklist;
