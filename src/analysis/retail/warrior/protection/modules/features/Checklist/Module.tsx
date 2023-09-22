import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';

import RageDetails from '../../core/RageDetails';
import RageTracker from '../../core/RageTracker';
import ShieldBlock from '../../spells/ShieldBlock';
import ShieldSlam from '../../spells/ShieldSlam';
import SpellReflect from '../../spells/SpellReflect';
import AlwaysBeCasting from '../AlwaysBeCasting';
import BlockCheck from '../BlockCheck';
import Component from './Component';
import RavagerHitCheck from '../../spells/RavagerHitCheck';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    rageDetails: RageDetails,
    rageTracker: RageTracker,
    shieldSlam: ShieldSlam,
    shieldBlock: ShieldBlock,
    blockCheck: BlockCheck,
    spellReflect: SpellReflect,
    ravagerHitCheck: RavagerHitCheck,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected rageDetails!: RageDetails;
  protected rageTracker!: RageTracker;
  protected shieldSlam!: ShieldSlam;
  protected shieldBlock!: ShieldBlock;
  protected blockCheck!: BlockCheck;
  protected spellReflect!: SpellReflect;
  protected ravagerHitCheck!: RavagerHitCheck;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          rageDetails: this.rageDetails.suggestionThresholds,
          shieldSlam: this.shieldSlam.suggestionThresholds,
          shieldBlock: this.shieldBlock.suggestionThresholds,
          blockCheck: this.blockCheck.suggestionThresholds,
          spellReflect: this.spellReflect.suggestionThresholds,
          ravagerHitCheck: this.ravagerHitCheck.averageHitSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
