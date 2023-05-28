import { HolyPowerDetails } from 'analysis/retail/paladin/shared';
import Abilities from 'parser/core/modules/Abilities';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import { apl, check as aplCheck } from '../../core/AplCheck';
import Consecration from '../../spells/Consecration';
import HammerOfTheRighteous from '../../spells/HammerOfTheRighteous';
import LightOfTheProtector from '../../spells/LightOfTheProtector';
import WordOfGlory from '../../spells/WordOfGlory';
import NoDamageShieldOfTheRighteous from '../NoDamageShieldOfTheRighteous';
import ShieldOfTheRighteous from '../ShieldOfTheRighteous';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
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

  render() {
    const checkResults = aplCheck(this.owner.eventHistory, this.owner.info);

    return (
      <Component
        apl={apl}
        checkResults={checkResults}
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        extras={{
          hotrAbility: this.hotr.activeSpell,
        }}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          consecration: this.consecration.uptimeSuggestionThresholds,
          sotrHitsMitigated: this.shieldOfTheRighteous.hitsMitigatedThreshold,
          noDamageSOTR: this.noDamageSOTR.hitRatioSuggestionThresholds,
          lotpDelay: this.lotp.delaySuggestion,
          lotpOverheal: this.lotp.overhealSuggestion,
          hotrBadCasts: this.hotr.badCastThreshold,
          hpWaste: this.hp.suggestionThresholds,
          wogOverheal: this.wog.overhealSuggestion,
          wogSlWaste: this.wog.wastedSlSuggestion,
        }}
      />
    );
  }
}

export default Checklist;
