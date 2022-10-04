import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';

import EnvelopingBreath from '../../spells/EnvelopingBreath';
import EssenceFontCancelled from '../../spells/EssenceFontCancelled';
import EssenceFontTargetsHit from '../../spells/EssenceFontTargetsHit';
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
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    EssenceFontTargetsHit: EssenceFontTargetsHit,
    refreshingJadeWind: RefreshingJadeWind,
    chiBurst: ChiBurst,
    spiritOfTheCrane: SpiritOfTheCrane,
    manaTea: ManaTea,
    lifecycles: Lifecycles,
    thunderFocusTea: ThunderFocusTea,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
    spinningCraneKick: SpinningCraneKick,
    vivify: Vivify,
    jadeSerpentStatue: JadeSerpentStatue,
    soothingMist: SoothingMist,
    envelopingBreath: EnvelopingBreath,
    EssenceFontCancelled: EssenceFontCancelled,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected EssenceFontTargetsHit!: EssenceFontTargetsHit;
  protected refreshingJadeWind!: RefreshingJadeWind;
  protected chiBurst!: ChiBurst;
  protected spiritOfTheCrane!: SpiritOfTheCrane;
  protected manaTea!: ManaTea;
  protected lifecycles!: Lifecycles;
  protected thunderFocusTea!: ThunderFocusTea;
  protected renewingMistDuringManaTea!: RenewingMistDuringManaTea;
  protected spinningCraneKick!: SpinningCraneKick;
  protected vivify!: Vivify;
  protected jadeSerpentStatue!: JadeSerpentStatue;
  protected soothingMist!: SoothingMist;
  protected envelopingBreath!: EnvelopingBreath;
  protected EssenceFontCancelled!: EssenceFontCancelled;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting
            .nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          essenceFont: this.EssenceFontTargetsHit.suggestionThresholds,
          envelopingBreath: this.envelopingBreath.suggestionThresholds,
          refreshingJadeWind: this.refreshingJadeWind.suggestionThresholds,
          chiBurst: this.chiBurst.suggestionThresholds,
          spiritOfTheCrane: this.spiritOfTheCrane.suggestionThresholds,
          manaTea: this.manaTea.suggestionThresholds,
          manaTeaOverhealing: this.manaTea.suggestionThresholdsOverhealing,
          spinningCraneKick: this.spinningCraneKick.suggestionThresholds,
          lifecycles: this.lifecycles.suggestionThresholds,
          thunderFocusTea: this.thunderFocusTea.suggestionThresholds,
          renewingMistDuringManaTea: this.renewingMistDuringManaTea.suggestionThresholds,
          vivify: this.vivify.suggestionThresholds,
          jadeSerpentStatue: this.jadeSerpentStatue.suggestionThresholds,
          soothingMist: this.soothingMist.suggestionThresholdsCasting,
          EssenceFontCancelled: this.EssenceFontCancelled.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
