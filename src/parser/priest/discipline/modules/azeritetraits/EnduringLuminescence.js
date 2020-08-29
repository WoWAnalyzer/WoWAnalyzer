import React from 'react';

import SPELLS from 'common/SPELLS';
import { calculateTraitHealing } from 'parser/shared/modules/helpers/CalculateTraitHealing';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

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

    _lastRadianceCastTimestamp = 0; // Setting a dummy timestamp to 0

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTrait(SPELLS.ENDURING_LUMINESCENCE.id);

        if (!this.active) {
            return;
        }

        this._rawBonusHealingPerHit = this.selectedCombatant.traitsBySpellId[SPELLS.ENDURING_LUMINESCENCE.id]
            .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.ENDURING_LUMINESCENCE.id, rank)[0], 0);

        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EVANGELISM_TALENT), this.handleEvangelismCasts);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE), this.storePowerWordRadiancesCastTimestamp);
        this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF), this.handleAtonementsApplications);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE), this.handleRadianceHits);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_NON_CRIT), this.handleAtonementsHits);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_CRIT), this.handleAtonementsHits);
    }

    storePowerWordRadiancesCastTimestamp(event){
        this._lastRadianceCastTimestamp = event.timestamp;
    }


    handleAtonementsHits(event){
        //Same situation as for Depth of the Shadows
        //Atonements in their Enduring window are fully counted since they would not be there otherwise
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

    handleEvangelismCasts(event){

        this._atonementsAppliedByRadiances.forEach((atonement, index) => {
            //Atonements in their normal duration window when Evangelism is cast
            if(event.timestamp > atonement.applyBuff.timestamp
            && event.timestamp < atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration){
                this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismPreEnduringWindow = true;
            }
            //Atonements in their Enduring Luminescence duration window when Evangelism is cast
            if(event.timestamp > atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration
            && event.timestamp < atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration + ENDURING_LUMINESCENCE_BONUS_MS){
                this._atonementsAppliedByRadiances[index].wasExtendedByEvangelismInEnduringWindow = true;
            }
        });
    }

    handleAtonementsApplications(event){

        if(event.timestamp !== this._lastRadianceCastTimestamp){
            return;
        }
    
        this._atonementsAppliedByRadiances.push({
            "applyBuff": event,
            "atonementEvents": [],
            "wasExtendedByEvangelismPreEnduringWindow": false,
            "wasExtendedByEvangelismInEnduringWindow": false,
        });
    }

    handleRadianceHits(event){
        this._bonusFromDirectHeal += calculateTraitHealing(this.statTracker.currentIntellectRating, POWER_WORD_RADIANCE_COEFFICIENT, this._rawBonusHealingPerHit, event).healing;
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