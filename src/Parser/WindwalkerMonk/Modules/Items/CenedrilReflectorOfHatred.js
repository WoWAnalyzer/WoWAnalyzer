import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS_MONK from 'common/SPELLS_MONK';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class CenedrilReflectorOfHatred extends Module {
    static dependencies = {
        abilityTracker: AbilityTracker,
        combatants: Combatants,
    };

    on_initialized() {
        this.active = this.combatants.selected.hasBack(ITEMS.CENEDRIL_REFLECTOR_OF_HATRED.id);
    }

    item() {
        const touchOfKarma = this.abilityTracker.getAbility(SPELLS_MONK.TOUCH_OF_KARMA_DAMAGE.id);
        const damage = touchOfKarma.damageEffective * 0.6;

        return {
            item: ITEMS.CENEDRIL_REFLECTOR_OF_HATRED,
            result: (
                <span>
                    {this.owner.formatItemDamageDone(damage)}
                </span>
            ),
        };
    }
}

export default CenedrilReflectorOfHatred;
