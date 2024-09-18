import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import JadeIgnition from '../../talents/JadeIgnition';
import LastEmperorsCapacitor from '../../talents/LastEmperorsCapacitor';
import XuensBattlegear from '../../talents/XuensBattlegear';
import ChiDetails from '../../resources/ChiDetails';
import BlackoutKick from '../../spells/BlackoutKick';
import ComboBreaker from '../../spells/ComboBreaker';
import ComboStrikes from '../../spells/ComboStrikes';
import FistsofFury from '../../spells/FistsofFury';
import TouchOfKarma from '../../spells/TouchOfKarma';
import HitCombo from '../../talents/HitCombo';
import Component from './Component';
import { aplProps } from 'analysis/retail/monk/windwalker/modules/apl/AplCheck';
import JadefireStomp from 'analysis/retail/monk/shared/JadefireStomp';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    touchOfKarma: TouchOfKarma,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,
    JadefireStomp: JadefireStomp,

    hitCombo: HitCombo,
    chiDetails: ChiDetails,

    lastEmperorsCapacitor: LastEmperorsCapacitor,
    jadeIgnition: JadeIgnition,
    xuensBattlegear: XuensBattlegear,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected comboBreaker!: ComboBreaker;
  protected fistsofFury!: FistsofFury;
  protected touchOfKarma!: TouchOfKarma;
  protected comboStrikes!: ComboStrikes;
  protected blackoutKick!: BlackoutKick;
  protected hitCombo!: HitCombo;
  protected chiDetails!: ChiDetails;
  protected lastEmperorsCapacitor!: LastEmperorsCapacitor;
  protected jadeIgnition!: JadeIgnition;
  protected xuensBattlegear!: XuensBattlegear;

  render() {
    return (
      <Component
        aplProps={aplProps(this.owner.eventHistory, this.owner.info)}
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          comboBreaker: this.comboBreaker.suggestionThresholds,
          fistsofFury: this.fistsofFury.suggestionThresholds,
          touchOfKarma: this.touchOfKarma.suggestionThresholds,
          comboStrikes: this.comboStrikes.suggestionThresholds,
          blackoutKick: this.blackoutKick.suggestionThresholds,

          hitCombo: this.hitCombo.suggestionThresholds,
          chiDetails: this.chiDetails.suggestionThresholds,

          lastEmperorsCapacitorAverageStacks:
            this.lastEmperorsCapacitor.averageStacksSuggestionThresholds,
          lastEmperorsCapacitorWastedStacks:
            this.lastEmperorsCapacitor.wastedStacksSuggestionThresholds,
          jadeIgnition: this.jadeIgnition.suggestionThresholds,
          xuensBattlegear: this.xuensBattlegear.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
