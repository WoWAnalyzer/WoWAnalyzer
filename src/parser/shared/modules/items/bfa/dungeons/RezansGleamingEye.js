import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

/**
 * Equip: Your attacks have a chance to grant you 510 Haste for 15 sec.
 * 
 * Example log: /report/mx1NKYzjwQncGk4J/33-Mythic+Fetid+Devourer+-+Kill+(4:47)/6-Jaelaw
 */

class RezansGleamingEye extends Analyzer {
    statBuff = 0;

    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTrinket(ITEMS.REZANS_GLEAMING_EYE.id);

        if(this.active) {
            this.statBuff = calculateSecondaryStatDefault(310, 510, this.selectedCombatant.getItem(ITEMS.REZANS_GLEAMING_EYE.id).itemLevel);
        }
    }

    get totalBuffUptime() {
        return this.selectedCombatant.getBuffUptime(SPELLS.REZANS_GLEAMING_EYE_BUFF.id) / this.owner.fightDuration;
    }

    item() {
        return {
        item: ITEMS.REZANS_GLEAMING_EYE,
        result: (
            <>
            {formatPercentage(this.totalBuffUptime)}% uptime<br />
            {formatNumber(this.totalBuffUptime * this.statBuff)} average Haste
            </>
        ),
        };
    }
}

export default RezansGleamingEye;