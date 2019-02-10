import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import { formatThousands, formatPercentage } from 'common/format';
import HealingDone from 'parser/shared/modules/HealingDone';

/*
 * Base class for self healing calculations. Handles rendering and calculations, each spec 
 * has a class that inherits from this to grab spec specific spell IDs. I.E. HolyPaladinSelfHealing
 */

class BaseSelfHealing extends Analyzer {
    static dependencies = {
        healingDone: HealingDone,
    };

    _healing = 0;
    _overhealing = 0;
    _selfHealPercent = 0;
    static SPELL_ARRAY = [];

    constructor(...args) {
        super(...args);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(this.constructor.SPELL_ARRAY), this._onHeal);
    }

    _onHeal(event) {
        this._healing += event.amount;
        this._healing += event.absorbed || 0;
        this._overhealing += event.overheal || 0;
    }

    get selfHealingPercent() {
        return this._healing / this.healingDone.total._regular;
    }

    statistic() {
        return (
            <StatisticBox
              position={STATISTIC_ORDER.CORE(61)}
              icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
              value={`${formatPercentage(this.selfHealingPercent)} %`}
              tooltip={`self-healing: <b>${formatThousands(this._healing)}</b>
                        self-overhealing:<b> ${formatThousands(this._overhealing)}</b>`}
              label="Self Healing"
            />
        );
    }
}

export default BaseSelfHealing;
