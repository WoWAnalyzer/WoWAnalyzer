import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';

class CenedrilTheReflector extends Module {
    static dependencies = {
        combatants: Combatants,
    };

    on_iniliatized() {
        this.active = this.combatants.seleceted.hasCloak(ITEM.CENEDRIL_THE_REFLECTOR.id);
    }

    item() {
        const touchOfKarma = this.abilityTracker.getAbility(SPELLS.MONK.TOUCH_OF_KARMA_DAMAGE.id);
        const damage = touchOfKarma.damageEffective * 0.6;

        return {
            item: ITEMS.CENEDRIL_THE_REFLECTOR,
            result: (
                <span>
                    {this.owner.formatItemDamageDone(damage)}
                </span>
            ),
        };
    }
}

export default CenedrilTheReflector;
