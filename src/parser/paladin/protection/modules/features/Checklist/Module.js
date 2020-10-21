import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import HolyPowerDetails from 'parser/paladin/shared/holypower/HolyPowerDetails';

import ShieldOfTheRighteous from '../ShieldOfTheRighteous';
import NoDamageShieldOfTheRighteous from '../NoDamageShieldOfTheRighteous';
import Consecration from '../../spells/Consecration';
import HammerOfTheRighteous from '../../spells/HammerOfTheRighteous';
import LightOfTheProtector from '../../spells/LightOfTheProtector';
import WordOfGlory from '../../spells/WordOfGlory';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    abilities: Abilities,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    noDamageSOTR: NoDamageShieldOfTheRighteous,
    consecration: Consecration,
    lotp: LightOfTheProtector,
    hotr: HammerOfTheRighteous,
    hp: HolyPowerDetails,
    wog: WordOfGlory,
  };

  render(){
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        extras={{
          hotrAbility: this.hotr.activeSpell,
        }}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          consecration: this.consecration.uptimeSuggestionThresholds,
          shieldOfTheRighteous: this.shieldOfTheRighteous.suggestionThresholds,
          noDamageSOTR: this.noDamageSOTR.hitRatioSuggestionThresholds,
          lotpDelay: this.lotp.delaySuggestion,
          lotpOverheal: this.lotp.overhealSuggestion,
          hotrBadCasts: this.hotr.badCastThreshold,
          hpWaste: this.hp.suggestionThresholds,
          wogOverheal: this.wog.overhealSuggestion,
          wogSlWaste: this.wog.wastedSlSuggestion,
          wogSotrCasts: this.wog.sotrSuggestion,
        }}
      />
    );
  }
}

export default Checklist;
