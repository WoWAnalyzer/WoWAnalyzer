import React from 'react';

import SPELLS from 'common/SPELLS';
import { calculateTraitHealing } from 'parser/shared/modules/helpers/CalculateTraitHealing';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import isAtonement from '../core/isAtonement';

import { POWER_WORD_RADIANCE_COEFFICIENT } from '../../constants';


const ENDURING_LUMINESCENCE_BONUS_MS = 1500;
const EVANGELISM_BONUS_MS = 6000;

/*
* Power Word: Radiance restores 1672 additional health, and applies Atonement for 70% of its normal duration.
*/
class EnduringLuminescense extends Analyzer {
    static dependencies = {
        statTracker: StatTracker,
    }
    _bonusFromAtonementDuration = 0;
    _bonusFromDirectHeal = 0;

    _rawBonusHealingPerHit = 0;

    _lastCastIsPowerWordRadiance = false;
    _atonementsAppliedByRadiances = [];

    constructor(...args) {
        super(...args);
        this._maxTargets = 5;
        this.active = this.selectedCombatant.hasTrait(SPELLS.ENDURING_LUMINESCENCE.id);

        if (!this.active) {
            return;
        }

        this._rawBonusHealingPerHit = this.selectedCombatant.traitsBySpellId[SPELLS.ENDURING_LUMINESCENCE.id]
            .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.ENDURING_LUMINESCENCE.id, rank)[0], 0);
    }

    on_byPlayer_cast(event){
        const spellId = event.ability.guid;

        if(spellId !== SPELLS.POWER_WORD_RADIANCE.id && spellId !== SPELLS.EVANGELISM_TALENT.id) {
            return;
        }

        if (spellId === SPELLS.POWER_WORD_RADIANCE.id) {
            console.log('Last cast is radiance');
            this._lastCastIsPowerWordRadiance = true;
        }

        if (spellId === SPELLS.EVANGELISM_TALENT.id){
            this._atonementsAppliedByRadiances.forEach((atonement, index) => {
                //Atonements in their normal duration when Evangelism is cast
                if(event.timestamp > atonement.applyBuff.timestamp
                && event.timestamp < atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration){
                    this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismPreEnduringWindow = true;
                }
                //Atonements in their Enduring Luminescence window when Evangelism is cast
                if(event.timestamp > atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration
                && event.timestamp < atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration + ENDURING_LUMINESCENCE_BONUS_MS){
                    this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismInEnduringWindow = true;
                }
            });
        }
    }

    on_byPlayer_applybuff(event){
        const spellId = event.ability.guid;

        if(spellId !== SPELLS.ATONEMENT_BUFF.id){
            return;
        }

        if (this._lastCastIsPowerWordRadiance) {

            //Any atonement that is applied by Power Word: Radiance will have its corresponding
            //applybuff event assigned a new property __modified set to true, indicating it comes from a Power Word: Radiance cast
            if(event.__modified !== true){
                this._lastCastIsPowerWordRadiance = false;
                return;
            }
      
            this._atonementsAppliedByRadiances.push({
              "applyBuff": event,
              "atonementEvents": [],
              "wasExtendedByEvangelismPreEnduringWindow": false,
              "wasExtendedByEvangelismInEnduringWindow": false,
            });
        }
    }

    calculateBonusAtonement(event) {

        if(!isAtonement(event)) { return; }

        this._atonementsAppliedByRadiances.forEach((atonement, index) => {
            const lowerBound = atonement.applyBuff.timestamp
                             + (atonement.wasExtendedByEvangelismPreDepthWindow ? EVANGELISM_BONUS_MS : 0)
                             + SPELLS.POWER_WORD_RADIANCE.atonementDuration;

            const upperBound = atonement.applyBuff.timestamp
                             + (atonement.wasExtendedByEvangelismPreDepthWindow || atonement.wasExtendedByEvangelismInDepthWindow ? EVANGELISM_BONUS_MS : 0)
                             + SPELLS.POWER_WORD_RADIANCE.atonementDuration
                             + ENDURING_LUMINESCENCE_BONUS_MS;
            
            if(event.targetID === atonement.applyBuff.targetID && event.timestamp > lowerBound && event.timestamp < upperBound){
                this._bonusFromAtonementDuration += event.amount;
                this._atonementsAppliedByRadiances[index].atonementEvents.push(event);
            }
        });
    }

    on_byPlayer_heal(event){
        if(event.ability.guid === SPELLS.POWER_WORD_RADIANCE.id){
            this._bonusFromDirectHeal += calculateTraitHealing(this.statTracker.currentIntellectRating, POWER_WORD_RADIANCE_COEFFICIENT, this._rawBonusHealingPerHit, event).healing;
        }
        this.calculateBonusAtonement(event);
    }

    statistic() {
        const total = this._bonusFromAtonementDuration + this._bonusFromDirectHeal; 
        const totalPct = this.owner.getPercentageOfTotalHealingDone(total);
        const bonusFromAtonementPct = this.owner.getPercentageOfTotalHealingDone(this._bonusFromAtonementDuration);
        const bonusFromDirectHealPct = this.owner.getPercentageOfTotalHealingDone(this._bonusFromDirectHeal);

        return (
          <AzeritePowerStatistic
            size="small"
            tooltip={(
                <>
                  Enduring Luminescence provided <b>{formatPercentage(totalPct)}%</b> healing.
                  <ul>
                    <li><b>{formatPercentage(bonusFromAtonementPct)}%</b> from extended Atonement</li>
                    <li><b>{formatPercentage(bonusFromDirectHealPct)}%</b> from direct extra Power Word: Radiance healing</li>
                  </ul>
                </>
            )}
          >
              <BoringSpellValueText
                spell={SPELLS.ENDURING_LUMINESCENCE}
              >
                  <ItemHealingDone amount={total} />
              </BoringSpellValueText>
          </AzeritePowerStatistic>
        );
    }
}

export default EnduringLuminescense;