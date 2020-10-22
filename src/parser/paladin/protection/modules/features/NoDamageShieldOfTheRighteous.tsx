import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { When, NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import { Trans } from '@lingui/macro';

/**
 * Analyzer to determine which, if any, SOTR casts did not result in a subsequent hit 
 * on at least 1 enemy. Operates by determining a mapping from cast to resulting hits and
 * reporting the ratio of casts with at least one hit to total casts.
 */
class NoDamageShieldOfTheRighteous extends Analyzer {
    private sotrCastsToHits: Map<CastEvent, DamageEvent[]> = new Map<CastEvent, DamageEvent[]>();
    private lastSotrCastPtr: CastEvent | null = null;

    constructor(options: Options) {
        super(options);
        this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this.registerSOTRCast);
        this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this.registerSOTRHit);
    }

    registerSOTRCast(event: CastEvent) {
        if (event.ability.guid !== SPELLS.SHIELD_OF_THE_RIGHTEOUS.id) {
            return;
        }
        this.sotrCastsToHits.set(event, []);
        this.lastSotrCastPtr = event;
    }

    registerSOTRHit(event: DamageEvent) {
        if (event.ability.guid !== SPELLS.SHIELD_OF_THE_RIGHTEOUS.id) {
            return;
        }
        if (this.lastSotrCastPtr !== null) {
            this.sotrCastsToHits.get(this.lastSotrCastPtr)?.push(event);
        }
    }

    get sotrCastToHitRatio(): number {
        const totalCasts: number = this.sotrCastsToHits.size;
        let numCastsWithHit = 0;
        this.sotrCastsToHits.forEach((hits, cast) => {
            if (hits.length > 0) {
                numCastsWithHit += 1;
            }
        });
        const ratio: number = numCastsWithHit / totalCasts;
        return ratio;
    }

    get hitRatioSuggestionThresholds(): NumberThreshold {
        return {
            actual: this.sotrCastToHitRatio,
            isLessThan: {
                minor: 0.98,
                average: 0.95,
                major: 0.92,
            },
            style: ThresholdStyle.PERCENTAGE,
        };
    }

    suggestions(when: When) {
        when(this.hitRatioSuggestionThresholds)
            .addSuggestion((suggest, actual, recommended) => suggest('SotR is a major source of damage. Make sure that each cast hits at least 1 enemy.')
            .icon(SPELLS.SHIELD_OF_THE_RIGHTEOUS.icon)
            .actual(`${formatPercentage(actual)}% of casts hit at least 1 target.`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`))
    }

    statistic() {
        return (
            <Statistic
                position={STATISTIC_ORDER.DEFAULT}
                size='flexible'
            >
                <BoringSpellValue 
                    spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS}
                    value={`${formatPercentage(this.sotrCastToHitRatio)} %`}
                    label={<Trans>SotR Casts That Hit An Enemy</Trans>}
                />
            </Statistic>
        )
    }
}

export default NoDamageShieldOfTheRighteous;

