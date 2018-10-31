import React from 'react';

import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import Enemies from 'parser/shared/modules/Enemies';
import ExecuteRange from './Execute/ExecuteRange';
import SpellUsable from '../features/SpellUsable';

class OverpowerAnalyzer extends Analyzer {
    static dependencies = {
        executeRange: ExecuteRange,
        enemies: Enemies,
        spellUsable: SpellUsable,
    }

    proc = 0;
    wastedProc = 0;

    hasEP = false;

    constructor(...args) {
        super(...args);
        this.hasEP = this.selectedCombatant.hasTrait(SPELLS.EXECUTIONERS_PRECISION_TRAIT.id);
    }

    on_byPlayer_cast(event) {
        if (event.ability.guid !== SPELLS.OVERPOWER.id) {
            return;
        }

        this.proc += 1;
        const overpower = this.selectedCombatant.getBuff(SPELLS.OVERPOWER.id);
        if (!this.executeRange.isTargetInExecuteRange(event) && !this.hasEP) {
            if (overpower !== undefined && overpower.stacks === 2 && this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id)) {
                this.wastedProc += 1;

                event.meta = event.meta || {};
                event.meta.isInefficientCast = true;
                event.meta.inefficientCastReason = 'This Overpower was used while already at 2 stacks and Mortal Strike was available';
            }
        } else if (this.hasEP) {
            if (overpower && overpower.stacks === 2 && this.spellUsable.isAvailable(SPELLS.MORTAL_STRIKE.id)){
                this.wastedProc += 1;

                event.meta = event.meta || {};
                event.meta.isInefficientCast = true;
                event.meta.inefficientCastReason = 'This Overpower was used while already at 2 stacks and Mortal Strike was available.';
            }
        }
    }

    get WastedOverpowerThresholds() {
        return {
            actual: this.wastedProc / this.proc,
            isGreaterThan: {
                minor: 0,
                average: 0.05,
                major: 0.1,
            },
            style: 'percentage',
        };
    }

    suggestions(when) {
        when(this.WastedOverpowerThresholds).addSuggestion((suggest, actual, recommended) => {
            return suggest(<>Try to avoid using <SpellLink id={SPELLS.OVERPOWER.id} icon /> at 2 stacks when <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> is available. Use your stacks of Overpower with Mortal Strike to avoid over stacking, which result in a loss of damage.</>)
                .icon(SPELLS.OVERPOWER.icon)
                .actual(`${formatPercentage(actual)}% of Overpower stacks were wasted.`)
                .recommended(`${formatPercentage(recommended)}% is recommended.`);
        });
    }
}

export default OverpowerAnalyzer;