import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import FuryDetails from '../../fury/FuryDetails';
import DemonSpikes from '../../spells/DemonSpikes';
import ShearFracture from '../../spells/ShearFracture';
import SoulCleaveSoulsConsumed from '../../spells/SoulCleaveSoulsConsumed';
import SoulsOvercap from '../../statistics/SoulsOvercap';
import SoulBarrier from '../../talents/SoulBarrier';
import SpiritBombFrailtyDebuff from '../../talents/SpiritBombFrailtyDebuff';
import SpiritBombSoulsConsume from '../../talents/SpiritBombSoulsConsume';
import VoidReaverDebuff from '../../talents/VoidReaverDebuff';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseModule {
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
    demonSpikes: DemonSpikes,
    shearFracture: ShearFracture,

    // Resources
    furyDetails: FuryDetails,
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
          demonSpikes: this.demonSpikes.suggestionThresholdsEfficiency,
          furyDetails: this.furyDetails.suggestionThresholds,
          soulsOvercap: this.soulsOvercap.suggestionThresholdsEfficiency,
          shearFracture: this.shearFracture.wastedCasts,
        }}
      />
    );
  }
}

export default Checklist;
