import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';
import RageDetails from '../../core/RageDetails';
import RageTracker from '../../core/RageTracker';
import ShieldSlam from '../../spells/ShieldSlam';
import ShieldBlock from '../../spells/ShieldBlock';
import BlockCheck from '../BlockCheck';
import SpellReflect from '../../spells/SpellReflect';

class Checklist extends BaseChecklist {
  static dependencies = {
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
        }}
      />
    );
  }
}

export default Checklist;
