import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';

class SoulOfTheGrandmaster extends Module {
    static dependencies = {
        combatants: Combatants,
    };

    on_iniliatized() {
        this.active = this.combatants.seleceted.hasRing(ITEM.SOUL_OF_THE_GRANDMASTER.id);
    }

    item() {
        const chiOrbit = this.abilityTracker.getAbility(TALENTS.MONK.CHI_ORBIT_TALENT.id);
        const damage = chiOrbit.damageEffective;

        return {
            item: ITEMS.SOUL_OF_THE_GRANDMASTER,
            result: (
                <span>
                    {this.owner.formatItemDamageDone(damage)}
                </span>
            ),
        };
    }
}

export default SoulOfTheGrandmaster;
