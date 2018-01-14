import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import ItemDamageDone from 'Main/ItemDamageDone';

class EchoesOfTheGreatSundering extends Analyzer {
    static dependencies = {
        combatants: Combatants,
    };

    BuffedEarthquakeCasts = 0;
    EchoesProcsCounter = 0;
    TotalEarthquakeDamage = 0;
    TotalEarthquakeCasts = 0;
    
    estimate_bonus_damage() {
        // Sorry for the magic number, but the goal is to estimate the bonus damage from buffed EQs by ~roughly~ calculating 
        // what fraction of EQ damage can be considered a result of the shoulder buff's 100% increase.
        return  (0.5 * this.TotalEarthquakeDamage * (this.BuffedEarthquakeCasts / this.TotalEarthquakeCasts));
    }

    on_initialized() {
        this.active = this.combatants.selected.hasShoulder(ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id);
    }

    on_byPlayer_cast(event) {
        const spellId = event.ability.guid;
        if (spellId !== SPELLS.EARTHQUAKE.id) {
            return;
        }
        if (this.combatants.selected.hasBuff(SPELLS.ECHOES_OF_THE_GREAT_SUNDERING_BUFF.id, event.timestamp)) {
            this.BuffedEarthquakeCasts += 1;
        }
        this.TotalEarthquakeCasts += 1;
    }

    on_byPlayer_damage(event) {
        const spellId = event.ability.guid;
        if (spellId === SPELLS.EARTHQUAKE_DAMAGE.id) {
            this.TotalEarthquakeDamage += event.amount;
        }
    }

    on_byPlayer_applybuff(event) {
        const spellId = event.ability.guid;
        if (spellId === SPELLS.ECHOES_OF_THE_GREAT_SUNDERING_BUFF.id) {
            this.EchoesProcsCounter += 1;
        }
    }

    item() {
        return {
            id: `item=${ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id}`,
            icon: <ItemIcon id={ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id} />,
            title: <ItemLink id={ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id} />,
            result: (
                <dfn data-tip={`Your utilization of Echoes of the Great Sundering: <ul> <li> Buffed Earthquakes: ${this.BuffedEarthquakeCasts}.</li> <li> Total procs:  ${this.EchoesProcsCounter}.</li></ul> `}>
                 Earthquake procs used: {formatPercentage(this.BuffedEarthquakeCasts / this.EchoesProcsCounter)}%<br />
                 <ItemDamageDone amount={this.estimate_bonus_damage()} /> 
              </dfn>
            ),
        };
    }
}
    export default EchoesOfTheGreatSundering;