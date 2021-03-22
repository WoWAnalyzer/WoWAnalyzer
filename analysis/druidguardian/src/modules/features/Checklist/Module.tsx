import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import ManaValues from 'parser/shared/modules/ManaValues';
import React from 'react';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';
import IronFur from '../../spells/IronFur';
import Thrash from '../../spells/Thrash';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    ironFur: IronFur,
    thrash: Thrash,
    //rageTracker: RageTracker,
    //shieldSlam: ShieldSlam,
    //shieldBlock: ShieldBlock,
    //blockCheck: BlockCheck,
    //spellReflect: SpellReflect,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected ironFur!: IronFur;
  protected thrash!: Thrash;
  //protected rageTracker!: RageTracker;
  //protected shieldSlam!: ShieldSlam;
  //protected shieldBlock!: ShieldBlock;
  //protected blockCheck!: BlockCheck;
  //protected spellReflect!: SpellReflect;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          ironFur: this.ironFur.suggestionThresholds,
          //shieldSlam: this.shieldSlam.suggestionThresholds,
          //shieldBlock: this.shieldBlock.suggestionThresholds,
          //blockCheck: this.blockCheck.suggestionThresholds,
          //spellReflect: this.spellReflect.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
