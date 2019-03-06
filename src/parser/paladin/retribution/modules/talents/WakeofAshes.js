import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class WakeofAshes extends Analyzer {
    static dependencies = {
        abilityTracker: AbilityTracker,
        spellUsable: SpellUsable,
    };

    totalHits = 0;
    badCasts = 0;
    wakeCast = false;
    wasteHP = false;
    wasteBlade = false;

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id);
        if (!this.active) {
            return;
        }
        this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WAKE_OF_ASHES_TALENT), this.onWakeofAshesDamage);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WAKE_OF_ASHES_TALENT), this.onWakeofAshesCast);
        this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.WAKE_OF_ASHES_TALENT), this.onWakeofAshesEnergize);
        this.addEventListener(Events.fightend, this.onFinished);
    }

    onWakeofAshesDamage(event) {
        this.totalHits += 1;
        this.wakeCast = false;
    }

    onWakeofAshesEnergize(event) {
        if (event.waste > 1 ){
            this.wasteHP = true;
        }
        if (event.waste === 1 && this.spellUsable.isAvailable(SPELLS.BLADE_OF_JUSTICE.id)){
            this.wasteBlade = true;
        }
    }

    onWakeofAshesCast(event) {
        if (this.wakeCast) {
            this.badCasts += 1;
        }
        this.wakeCast = true;
        if (this.wasteHP) {
            event.meta = event.meta || {};
            event.meta.isInefficientCast = true;
            event.meta.inefficientCastReason = '2HP or more wasted. You should either use or wait for a HP generator and spend before using Wake.';
            this.wasteHP = false;
        }
        if (this.wasteBlade) {
            event.meta = event.meta || {};
            event.meta.isInefficientCast = true;
            event.meta.inefficientCastReason = '1HP wasted while Blade of Justice was off of CD. Use Blade and a HP spender before using Wake.';
            this.wasteBlade = false;
        }
    }

    onFinished() {
        if (this.wakeCast) {
            this.badCasts += 1;
        }
    }

    get averageHitPerCast() {
        return this.totalHits / this.abilityTracker.getAbility(SPELLS.WAKE_OF_ASHES_TALENT.id).casts;
    }

    get badCastsThresholds() {
        return {
            actual: this.badCasts,
            isGreaterThan: {
                minor: 0,
                average: 0,
                major: 0,
            },
            style: 'number',
        };
    }

    suggestions(when) {
        when(this.badCastsThresholds)
            .addSuggestion((suggest, actual, recommended) => {
                return suggest(<><SpellLink id={SPELLS.WAKE_OF_ASHES_TALENT.id} /> hit 0 targets {(this.badCasts)} time(s). <SpellLink id={SPELLS.BLADE_OF_JUSTICE.id} /> has the same range of 12yds. You can use this as a guideline to tell if targets will be in range.</>)
                    .icon(SPELLS.WAKE_OF_ASHES_TALENT.icon)
                    .actual(`${(this.badCasts)} casts with no targets hit.`)
                    .recommended(`${(recommended)} is recommended`);
            });
    }

    statistic() {
        return (
            <StatisticBox
              position={STATISTIC_ORDER.UNIMPORTANT()}
              icon={<SpellIcon id={SPELLS.WAKE_OF_ASHES_TALENT.id} />}
              value={(
                    <>
                        {(this.averageHitPerCast.toFixed(2))} Average<br />
                        {`${this.badCasts > 0 ? `${this.badCasts} Missed` : ''} `}
                    </>
                )}
              label="Targets Hit"
              tooltip={`You averaged ${(this.averageHitPerCast.toFixed(2))} hits per cast of Wake of Ashes. ${this.badCasts > 0 ? `Additionally, you cast Wake of Ashes ${this.badCasts} time(s) without hitting anything.` : ''}`}
            />
        );
    }
}

export default WakeofAshes;
