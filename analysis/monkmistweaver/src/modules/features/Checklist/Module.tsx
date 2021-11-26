import PreparationRuleAnalyzer from 'parser/shadowlands/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';
import React from 'react';

import EnvelopingBreath from '../../spells/EnvelopingBreath';
import EssenceFont from '../../spells/EssenceFont';
import SoothingMist from '../../spells/SoothingMist';
import SpinningCraneKick from '../../spells/SpinningCraneKick';
import ThunderFocusTea from '../../spells/ThunderFocusTea';
import Vivify from '../../spells/Vivify';
import ChiBurst from '../../talents/ChiBurst';
import JadeSerpentStatue from '../../talents/JadeSerpentStatue';
import Lifecycles from '../../talents/Lifecycles';
import ManaTea from '../../talents/ManaTea';
import RefreshingJadeWind from '../../talents/RefreshingJadeWind';
import RenewingMistDuringManaTea from '../../talents/RenewingMistDuringManaTea';
import SpiritOfTheCrane from '../../talents/SpiritOfTheCrane';
import Tier30Comparison from '../../talents/Tier30Comparison';
import AlwaysBeCasting from '../AlwaysBeCasting';
import EssenceFontMastery from '../EssenceFontMastery';
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
    soothingMist: SoothingMist,
    tier30Comparison: Tier30Comparison,
    envelopingBreath: EnvelopingBreath,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected essenceFont!: EssenceFont;
  protected refreshingJadeWind!: RefreshingJadeWind;
  protected chiBurst!: ChiBurst;
  protected spiritOfTheCrane!: SpiritOfTheCrane;
  protected manaTea!: ManaTea;
  protected lifecycles!: Lifecycles;
  protected thunderFocusTea!: ThunderFocusTea;
  protected essenceFontMastery!: EssenceFontMastery;
  protected renewingMistDuringManaTea!: RenewingMistDuringManaTea;
  protected spinningCraneKick!: SpinningCraneKick;
  protected vivify!: Vivify;
  protected jadeSerpentStatue!: JadeSerpentStatue;
  protected soothingMist!: SoothingMist;
  protected tier30Comparison!: Tier30Comparison;
  protected envelopingBreath!: EnvelopingBreath;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          nonHealingTimeSuggestionThresholds:
            this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          essenceFont: this.essenceFont.suggestionThresholds,
          envelopingBreath: this.envelopingBreath.suggestionThresholds,
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
          soothingMist: this.soothingMist.suggestionThresholdsCasting,
          tier30Comparison: this.tier30Comparison.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
