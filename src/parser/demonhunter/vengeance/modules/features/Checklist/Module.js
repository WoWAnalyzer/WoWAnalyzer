import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

// Buffs-Debuffs
import SpiritBombFrailtyDebuff from '../../talents/SpiritBombFrailtyDebuff';
import VoidReaverDebuff from '../../talents/VoidReaverDebuff';

// Talents
import SpiritBombSoulsConsume from '../../talents/SpiritBombSoulsConsume';
import SoulBarrier from '../../talents/SoulBarrier';

//Spells
import SoulCleaveSoulsConsumed from '../../spells/SoulCleaveSoulsConsumed';

// Resources
import PainDetails from '../../pain/PainDetails';
import SoulsOvercap from '../../statistics/SoulsOvercap';

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
