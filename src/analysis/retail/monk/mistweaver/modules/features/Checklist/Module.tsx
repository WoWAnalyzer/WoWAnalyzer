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
import ChiBurst from '../../spells/ChiBurst';
import JadeSerpentStatue from '../../spells/JadeSerpentStatue';
import Lifecycles from '../../spells/Lifecycles';
import ManaTea from '../../spells/ManaTea';
import RefreshingJadeWind from '../../spells/RefreshingJadeWind';
import RenewingMistDuringManaTea from '../../spells/RenewingMistDuringManaTea';
import SpiritOfTheCrane from '../../spells/SpiritOfTheCrane';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';
import VivaciousVivification from '../../spells/VivaciousVivify';
import AncientTeachingsoftheMonastery from '../../spells/AncientTeachingsoftheMonastery';

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
    vivaciousVivification: VivaciousVivification,
    ancientTeachingsoftheMonastery: AncientTeachingsoftheMonastery,
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
  protected vivaciousVivification!: VivaciousVivification;
  protected ancientTeachingsoftheMonastery!: AncientTeachingsoftheMonastery;

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
          vivaciousVivification: this.vivaciousVivification.suggestionThresholds,
          ancientTeachings: this.ancientTeachingsoftheMonastery.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
