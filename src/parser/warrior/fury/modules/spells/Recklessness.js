import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import StatisticBox from 'interface/others/StatisticBox';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';

class Recklessness extends Analyzer {
    reckRageGen = 0;
    totalRageGen = 0;
    reckDamage = 0;

    constructor(...args) {
        super(...args);

        this.addEventListener(Events.energize.by(SELECTED_PLAYER).to(SELECTED_PLAYER), this.onPlayerEnergize);
        this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    }

    onPlayerEnergize(event) {
        const resource = event.classResources && event.classResources.find(classResources => classResources.type === RESOURCE_TYPES.RAGE.id);

        if (!resource) return;

        if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
            this.reckRageGen += event.resourceChange / 2;
        }

        this.totalRageGen += event.resourceChange;
    }

    onPlayerDamage(event) {
        if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
            this.reckDamage += event.amount;
        }
    }

    get ratioReckRageGen() {
        return this.reckRageGen / this.totalRageGen;
    }

    get reckDPS() {
        return this.owner.getPercentageOfTotalDamageDone(this.reckDamage);
    }

    statistic() {
        return (
            <StatisticBox 
              icon={<SpellIcon id={SPELLS.RECKLESSNESS.id} />}
              label="Recklessness"
              value={`${this.reckRageGen} extra rage generated`}
              tooltip={`<b>${formatPercentage(this.ratioReckRageGen)}%</b> of your rage and <b>${formatPercentage(this.reckDPS)}% (${formatThousands(this.reckDamage)}) </b> of your damage was generated during Recklessness.`}
            />
        );
    }
}

export default Recklessness;