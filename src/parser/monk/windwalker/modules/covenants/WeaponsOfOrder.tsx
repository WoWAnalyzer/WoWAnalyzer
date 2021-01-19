import React from 'react'
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import Statistic from 'interface/statistics/Statistic';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Abilities from 'parser/core/modules/Abilities';

import { ABILITIES_AFFECTED_BY_MASTERY, CHI_SPENDERS, BLACKOUT_KICK_COOLDOWN_REDUCTION_MS, DAMAGE_AFFECTED_BY_MASTERY } from '../../constants';
import WeaponsOfOrder from '../../../shared/modules/covenants/WeaponsOfOrder';

class WeaponsOfOrderWindwalker extends WeaponsOfOrder {
    static dependencies = {
        abilities: Abilities,
        spellUsable: SpellUsable,
    };
    protected spellUsable!: SpellUsable;

    _lastSpellUsed: number | null = null;
    chiDiscounted = 0;
    extraRisingSunKickReductionMs = 0;
    extraFistsOfFuryReductionMs = 0;
    damageGain = 0;
    mastery = false;

    constructor(options: Options) {
        super(options);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.blackoutKickCast);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CHI_SPENDERS), this.chiSpenderCast);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_MASTERY), this.masteryCast);
        this.addEventListener(Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(DAMAGE_AFFECTED_BY_MASTERY), this.masteryDamage);
    }

    blackoutKickCast() {
        if (!this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)) {
            return;
        }
        if (this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
            this.extraFistsOfFuryReductionMs += this.spellUsable.reduceCooldown(SPELLS.FISTS_OF_FURY_CAST.id, BLACKOUT_KICK_COOLDOWN_REDUCTION_MS);
        }
        if (this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
            this.extraRisingSunKickReductionMs += this.spellUsable.reduceCooldown(SPELLS.RISING_SUN_KICK.id, BLACKOUT_KICK_COOLDOWN_REDUCTION_MS);
        }
    }

    chiSpenderCast(event: CastEvent) {
        if (!this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_CHI_DISCOUNT.id)) {
            return;
        }
        if (this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id)) {
            return;
        }
        if (event.ability.guid === SPELLS.BLACKOUT_KICK.id && this.selectedCombatant.hasBuff(SPELLS.COMBO_BREAKER_BUFF, null, 500)) {
            return;
        }
        if (event.ability.guid === SPELLS.SPINNING_CRANE_KICK.id && this.selectedCombatant.hasBuff(SPELLS.DANCE_OF_CHI_JI_BUFF, null, 500)) {
            return;
        }
        this.chiDiscounted += 1;
    }

    masteryCast(event: CastEvent) {
        if (this._lastSpellUsed === event.ability.guid) {
            this.mastery = false;
            return;
        }
        this.mastery = true;
    }

    masteryDamage(event: DamageEvent) {
        if (!this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)) {
            return;
        }
        // there might be some very rare cases where mastery affected damage is happening after the cast of another mastery spell, but should be negligible even if it happens 
        if (!this.mastery) {
            return;
        }
        this.damageGain += calculateEffectiveDamage(event, this.masteryBuffPercentage);
    }

    get dps() {
        return this.damageGain / this.owner.fightDuration * 1000;
    }

    statistic() {
        return (
            <Statistic size="flexible">
                <BoringSpellValueText spell={SPELLS.WEAPONS_OF_ORDER_CAST}>
                    <span>
                        <img
                            src="/img/sword.png"
                            alt="Damage"
                            className="icon"
                        /> {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageGain))} % of total</small>
                        <br />
                        <ResourceIcon id={RESOURCE_TYPES.CHI.id} /> {this.chiDiscounted} <small>Chi Discounted</small>
                        <br />
                        <SpellIcon
                            id={SPELLS.RISING_SUN_KICK.id}
                            style={{
                                height: '1.3em',
                                marginTop: '-1.em',
                            }}
                            /> {(this.extraRisingSunKickReductionMs / 1000).toFixed(1)} <small>Seconds reduced</small>
                        <br />
                        <SpellIcon
                            id={SPELLS.FISTS_OF_FURY_CAST.id}
                            style={{
                                height: '1.3em',
                                marginTop: '-1.em',
                            }}
                            /> {(this.extraFistsOfFuryReductionMs / 1000).toFixed(1)} <small>Seconds reduced</small>
                    </span>
                </BoringSpellValueText>
            </Statistic>
        );
    }
}

export default WeaponsOfOrderWindwalker;
