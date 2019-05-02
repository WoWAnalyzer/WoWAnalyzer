import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import EssenceFont from '../../spells/EssenceFont';
import RefreshingJadeWind from '../../talents/RefreshingJadeWind';
import ChiBurst from '../../talents/ChiBurst';
import SpiritOfTheCrane from '../../talents/SpiritOfTheCrane';
import ManaTea from '../../talents/ManaTea';
import Lifecycles from '../../talents/Lifecycles';
import ThunderFocusTea from '../../spells/ThunderFocusTea';
import EssenceFontMastery from '../EssenceFontMastery';
import RenewingMistDuringManaTea from '../../talents/RenewingMistDuringManaTea';
import SpinningCraneKick from '../../spells/SpinningCraneKick';
import Vivify from '../../spells/Vivify';
import JadeSerpentStatue from '../../talents/JadeSerpentStatue';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    essenceFont: EssenceFont,
    refreshingJadeWind: RefreshingJadeWind,
    chiBurst: ChiBurst,
    spiritOfTheCrane: SpiritOfTheCrane,
    manaTea: ManaTea,
    lifecycles: Lifecycles,
    thunderFocusTea: ThunderFocusTea,
    essenceFontMastery: EssenceFontMastery,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
    spinningCraneKick: SpinningCraneKick,
    vivify: Vivify,
    jadeSerpentStatue: JadeSerpentStatue,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          essenceFont: this.essenceFont.suggestionThresholds,
          refreshingJadeWind: this.refreshingJadeWind.suggestionThresholds,
          chiBurst: this.chiBurst.suggestionThresholds,
          spiritOfTheCrane: this.spiritOfTheCrane.suggestionThresholds,
          manaTea: this.manaTea.suggestionThresholds,
          manaTeaOverhealing: this.manaTea.suggestionThresholdsOverhealing,
          spinningCraneKick: this.spinningCraneKick.suggestionThresholds,
          lifecycles: this.lifecycles.suggestionThresholds,
          thunderFocusTea: this.thunderFocusTea.suggestionThresholds,
          essenceFontMastery: this.essenceFontMastery.suggestionThresholds,
          renewingMistDuringManaTea: this.renewingMistDuringManaTea.suggestionThresholds,
          vivify: this.vivify.suggestionThresholds,
          jadeSerpentStatue: this.jadeSerpentStatue.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
