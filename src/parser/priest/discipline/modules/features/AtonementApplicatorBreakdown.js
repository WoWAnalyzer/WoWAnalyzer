import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import DonutChart from 'interface/statistics/components/DonutChart';
import Statistic from 'interface/statistics/Statistic';
import Events from 'parser/core/Events';

const ENDURING_LUMINESCENCE_BONUS_MS = 1500;
const DEPTH_OF_THE_SHADOWS_BONUS_MS = 2000;
const EVANGELISM_BONUS_MS = 6000;

//Needed to count healing for the rare situations where atonement heal events happens at the exact moment it expires
const FAIL_SAFE_MS = 300;

class AtonementApplicatorBreakdown extends Analyzer{
    _shadowmendsCasts = [];
    _powerWordShieldsCasts = [];

    _castsApplyBuffsMap = new Map(); // Keys = Cast, Values = Atonement buff associated to the cast
    _lastRadianceCastTimestamp = 0; // Setting a dummy timestamp to 0

    _atonementHealingFromShadowMends = 0;
    _atonementHealingFromPowerWordRadiances = 0;
    _atonementHealingFromPowerWordShields = 0;
    _prepullApplicatorHealing = 0;

    _hasEL = false;
    _hasDepth = false;

    constructor(...args) {
        super(...args);

        this._hasEL = this.selectedCombatant.hasTrait(SPELLS.ENDURING_LUMINESCENCE.id);
        this._hasDepth = this.selectedCombatant.hasTrait(SPELLS.DEPTH_OF_THE_SHADOWS.id);

        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EVANGELISM_TALENT), this.handleEvangelismCasts);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_MEND), this.storeShadowMendsCasts);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD), this.storePowerWordShieldsCasts);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE), this.storePowerWordRadiancesCastTimestamp);
        this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF), this.assignAtonementBuffToApplicator);
        this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_BUFF), this.assignAtonementBuffToApplicator);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_NON_CRIT), this.handleAtonementsHits);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ATONEMENT_HEAL_CRIT), this.handleAtonementsHits);
    }

    storeShadowMendsCasts(event){
        this._castsApplyBuffsMap.set({
            "event": event,
            "applicatorId": SPELLS.SHADOW_MEND.id,
        }, null);
    }
    
    storePowerWordShieldsCasts(event){
        this._castsApplyBuffsMap.set({
            "event": event,
            "applicatorId": SPELLS.POWER_WORD_SHIELD.id,
        }, null);
    }
    
    storePowerWordRadiancesCastTimestamp(event){
        this._lastRadianceCastTimestamp = event.timestamp;
    }

    assignAtonementBuffToApplicator(event){
        if(event.__fabricated === true){
            return;
        }

        if(event.timestamp === this._lastRadianceCastTimestamp){ // Power Word: Radiance

            //Set the wasRefreshed property of the old atonement on the same target to true
            //so we can stop attributing atonement healing to the old atonement
            if(event.type === "refreshbuff"){
                this.setWasRefreshedProperty(event, true);
            }

            //Putting a custom event object for Radiances since there is only 1 cast for 5 buffs
            this._castsApplyBuffsMap.set({
                "event": {
                    "timestamp": this._lastRadianceCastTimestamp,
                },
                "applicatorId": SPELLS.POWER_WORD_RADIANCE.id,
            }, 
            {
                "applyBuff": event,
                "atonementEvents": [],
                "extendedByEvangelism": false,
                "wasRefreshed": false,
            });
        } else { //Shadow Mend and Power Word: Shield
            if(event.type === "refreshbuff"){
                this.setWasRefreshedProperty(event, true);
            }

            //Get the latest cast with the corresponding targetID
            const playerWithAtonement = event.targetID;
            const reversedMapKeys = Array.from(this._castsApplyBuffsMap.keys()).slice().reverse();
            const mostRecentCastApplyBuff = reversedMapKeys.find(cast => cast.event && cast.event.targetID === playerWithAtonement);
            if (mostRecentCastApplyBuff) {
                this._castsApplyBuffsMap.set(mostRecentCastApplyBuff, {
                    "applyBuff": event,
                    "atonementEvents": [],
                    "extendedByEvangelism": false,
                    "wasRefreshed": false,
                });
            }
        }
    }

    getAtonementDuration(cast){
        let duration = 0;
        if(cast.applicatorId === SPELLS.POWER_WORD_RADIANCE.id){
            duration += SPELLS.POWER_WORD_RADIANCE.atonementDuration
                     + (this._hasEL ? ENDURING_LUMINESCENCE_BONUS_MS : 0);
        } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id){
            duration += SPELLS.POWER_WORD_SHIELD.atonementDuration;
        } else if (cast.applicatorId === SPELLS.SHADOW_MEND.id){
            duration += SPELLS.SHADOW_MEND.atonementDuration
                     + (this._hasDepth ? DEPTH_OF_THE_SHADOWS_BONUS_MS : 0);
        }
        return (duration + FAIL_SAFE_MS);
    }

    assignAtonementHit(cast, atonement, healEvent){
        const lowerBound = atonement.applyBuff.timestamp;
        const upperBound = atonement.applyBuff.timestamp
                        + (atonement.extendedByEvangelism ? EVANGELISM_BONUS_MS : 0)
                        + this.getAtonementDuration(cast);
        if(healEvent.targetID === atonement.applyBuff.targetID && healEvent.timestamp > lowerBound && healEvent.timestamp < upperBound){
            if(!atonement.wasRefreshed){
                atonement.atonementEvents.push(healEvent);
                return healEvent.amount;
            }
        }
        
        return 0;
    }

    handleAtonementsHits(event){
        //Healing from atonements pre-applied before entering combat
        //will assume PW:S as the applicator since it's usually the most common one used pre-pull,
        const atonementBuffs = this._castsApplyBuffsMap.values();
        if(Array.from(atonementBuffs).find(atonement => atonement === null || atonement.applyBuff.targetID === event.targetID) === undefined){
            this._prepullApplicatorHealing += event.amount;
        }

        this._castsApplyBuffsMap.forEach((atonement, cast) => {
            //Sometimes an atonement heal event from the already active atonements happens after an applicator cast and before the next atonement buff is applied
            //so this null check is necessary
            if(atonement === null){
                return;
            }

            if(cast.applicatorId === SPELLS.POWER_WORD_RADIANCE.id){
                this._atonementHealingFromPowerWordRadiances += this.assignAtonementHit(cast, atonement, event);
            } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id){
                this._atonementHealingFromPowerWordShields += this.assignAtonementHit(cast, atonement, event);
            } else if (cast.applicatorId === SPELLS.SHADOW_MEND.id){
                this._atonementHealingFromShadowMends += this.assignAtonementHit(cast, atonement, event);
            }
        });
    }
    
    handleEvangelismCasts(event){
        this._castsApplyBuffsMap.forEach((atonement, cast) => {
            if(atonement === null){
                return;
            }
            
            if(cast.applicatorId === SPELLS.POWER_WORD_RADIANCE.id){
                if(event.timestamp > atonement.applyBuff.timestamp 
                && event.timestamp < atonement.applyBuff.timestamp + SPELLS.POWER_WORD_RADIANCE.atonementDuration + (this._hasEL ? ENDURING_LUMINESCENCE_BONUS_MS : 0)){
                    atonement.extendedByEvangelism = true;
                }
            } else if (cast.applicatorId === SPELLS.POWER_WORD_SHIELD.id){
                if(event.timestamp > atonement.applyBuff.timestamp 
                && event.timestamp < atonement.applyBuff.timestamp + SPELLS.POWER_WORD_SHIELD.atonementDuration){
                    atonement.extendedByEvangelism = true;
                }
            } else if (cast.applicatorId === SPELLS.SHADOW_MEND.id){
                if(event.timestamp > atonement.applyBuff.timestamp 
                && event.timestamp < atonement.applyBuff.timestamp + SPELLS.SHADOW_MEND.atonementDuration + (this._hasDepth ? DEPTH_OF_THE_SHADOWS_BONUS_MS : 0)){
                    atonement.extendedByEvangelism = true;
                }
            }
        });
    }

    setWasRefreshedProperty(applyBuffEvent, isRefreshed){
        const playerWithAtonement = applyBuffEvent.targetID;
        const reversedMapKeys = Array.from(this._castsApplyBuffsMap.keys()).slice().reverse();

        const mostRecentCastApplyBuff = reversedMapKeys.find(cast => cast.event && cast.event.targetID === playerWithAtonement);
        if (mostRecentCastApplyBuff) {
            const atonementBuff = this._castsApplyBuffsMap.get(mostRecentCastApplyBuff);
            if(atonementBuff !== null){
                atonementBuff.wasRefreshed = isRefreshed;
            }
        }
    }

    renderAtonementApplicatorChart(){
        const items = [
            {
                color: '#fff',
                label: 'Power Word: Shield',
                spellId: SPELLS.POWER_WORD_SHIELD.id,
                value: (this._atonementHealingFromPowerWordShields + this._prepullApplicatorHealing),
                valueTooltip: formatThousands(this._atonementHealingFromPowerWordShields + this._prepullApplicatorHealing),
            },
            {
                color: '#fcba03',
                label: 'Power Word: Radiance',
                spellId: SPELLS.POWER_WORD_RADIANCE.id,
                value: (this._atonementHealingFromPowerWordRadiances),
                valueTooltip: formatThousands(this._atonementHealingFromPowerWordRadiances),
            },
            {
                color: '#772bb5',
                label: 'Shadow Mend',
                spellId: SPELLS.SHADOW_MEND.id,
                value: (this._atonementHealingFromShadowMends),
                valueTooltip: formatThousands(this._atonementHealingFromShadowMends),
            },
        ];

        return ( <DonutChart items={items} /> );
    }

    statistic(){
        return (
            <Statistic
              position={STATISTIC_ORDER.CORE(20)}
              size="flexible"
              tooltip={`The Atonement healing contributed by each Atonement applicator.`}
            >
                <div className="pad">
                    <label><SpellLink id={SPELLS.ATONEMENT_BUFF.id}>Atonement</SpellLink> applicators breakdown</label>
                    {this.renderAtonementApplicatorChart()}
                </div>
            </Statistic>
        );
    }
}

export default AtonementApplicatorBreakdown;