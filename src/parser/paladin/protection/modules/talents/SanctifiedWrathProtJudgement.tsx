import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import { formatNumber } from 'common/format';

/**
 * 
 */
class SanctifiedWrathProtJudgement extends Analyzer {
    sanctifiedWrathAWModifier = (baseBuffLength: number) => baseBuffLength * 1.25;
    buffedJudgements: number = 0;
    unbuffedJudgements: number = 0;
    holyPowerWastes: number[] = [];
    additionalAvengingWrathUptime: number = 0;

    constructor(options: Options) {
        super(options);
        this.active = this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_PROT_TALENT.id);
        if (!this.active) {
            return;
        }

        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST), this.trackJudgmentCasts);
        this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.trackedWastedJudgmentHP);
    }

    trackJudgmentCasts(event: CastEvent) {
        if (this.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id)) {
            this.buffedJudgements += 1;
        } else {
            this.unbuffedJudgements += 1;
        }
    }

    trackedWastedJudgmentHP(event: EnergizeEvent) {
        const hasAW: boolean = this.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id);
        const judgementSource: boolean = event.ability.guid === SPELLS.JUDGMENT_CAST.id;
        const wastedHolyPower: boolean = event.waste !== null && event.waste !== undefined && event.waste > 0;
        if (hasAW && judgementSource && wastedHolyPower) {
            this.holyPowerWastes.push(event.waste);
        }
    }

    statistic() {
        const totalWastedHP = this.holyPowerWastes.reduce((sum, current) => sum + current, 0);
        const bonusHP = this.buffedJudgements - totalWastedHP;
        return (
            <Statistic
                position={STATISTIC_ORDER.DEFAULT}
                size="flexible"
                category={STATISTIC_CATEGORY.TALENTS}
            >
                <BoringSpellValue
                    spell={SPELLS.SANCTIFIED_WRATH_PROT_TALENT}
                    value={`${formatNumber(bonusHP)} Extra Holy Power`}
                    label={`${this.buffedJudgements * 2} extra Holy Power generated of which ${totalWastedHP} was wasted.`}
                />
            </Statistic>
        );
    }
}

export default SanctifiedWrathProtJudgement;