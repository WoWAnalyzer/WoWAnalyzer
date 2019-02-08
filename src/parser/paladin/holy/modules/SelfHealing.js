import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import HealingDone from 'parser/shared/modules/HealingDone';

import { DIRECT_SELF_HEALING_ABILITIES } from '../constants';

/*
 * Calculates targeted healing on self
 */

class SelfHealing extends Analyzer {
    static dependencies = {
        healingDone: HealingDone
    };


    _healing = 0;
    _overhealing = 0;
    _selfHealPercent = 0;
    constructor(...args) {
        super(...args);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onCast);
    }

    _onCast(event) {
        if (DIRECT_SELF_HEALING_ABILITIES.includes(event.ability.guid)) {
            if (this.owner.player.id === event.targetID) {
                this._healing += event.amount;
                this._overhealing += event.overheal;
            }
        };
    }

    getSelfHealingPercent() {
        return this._healing / this.healingDone.total._regular;
    }
    statistic() {
        return (
            <StatisticBox
                position={STATISTIC_ORDER.CORE(61)}
                icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
                value={`${formatPercentage(this.getSelfHealingPercent())} %`}
                tooltip={`self-healing: <b>${formatThousands(this._healing)}</b>
                        self-overhealing:<b> ${formatThousands(this._overhealing)}</b>`}
                label="Self Healing"
            />
        );
    }
}

export default SelfHealing;
