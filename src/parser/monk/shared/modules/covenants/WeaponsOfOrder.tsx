import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';

const BASE_MASTERY_PERCENTAGE = 0.1;

class WeaponsOfOrder extends Analyzer {
    static dependencies = {
      abilities: Abilities,
    };
    protected abilities!: Abilities;
    
    constructor(options: Options) {
        super(options);
        this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
        
        (options.abilities as Abilities).add({
            spell: SPELLS.WEAPONS_OF_ORDER_CAST,
            category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
            cooldown: 180,
            gcd: {
              base: this.selectedCombatant.spec === SPECS.MISTWEAVER_MONK ? 1500 : 1000,
            },
            castEfficiency: {
              suggestion: true,
              recommendedEfficiency: 0.8,
            },
        });
    }

    get masteryBuffPercentage() {
        return BASE_MASTERY_PERCENTAGE * this.selectedCombatant.spec.masteryCoefficient;
    }
}

export default WeaponsOfOrder;