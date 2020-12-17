import Analyzer, { Options } from 'parser/core/Analyzer';
import COVENANTS from 'game/shadowlands/COVENANTS';

const BASE_MASTERY_PERCENTAGE = 0.1;

class WeaponsOfOrder extends Analyzer {
    constructor(options: Options) {
        super(options);
        this.active = this.selectedCombatant.hasCovenant(COVENANTS.KYRIAN.id);
    }

    get masteryBuffPercentage() {
        return BASE_MASTERY_PERCENTAGE * this.selectedCombatant.spec.masteryCoefficient;
    }
}

export default WeaponsOfOrder;