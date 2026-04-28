import { Options } from 'parser/core/Analyzer';
import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

class Haste extends CoreHaste {
  constructor(options: Options) {
    super(options);
    /* https://www.wowhead.com/spell=429420/potent-enchantments (as-of 12.0.5)
     * "Whirling Stars increases the haste you gain during Celestial Alignment by an additional 10%."
     */
    if (
      this.selectedCombatant.hasTalent(TALENTS_DRUID.POTENT_ENCHANTMENTS_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_DRUID.WHIRLING_STARS_TALENT)
    ) {
      this.addHasteBuff(SPELLS.CELESTIAL_ALIGNMENT.id, 0.2);
      this.addHasteBuff(SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id, 0.2);
    } else {
      this.addHasteBuff(SPELLS.CELESTIAL_ALIGNMENT.id, 0.1);
      this.addHasteBuff(SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id, 0.1);
    }
  }
}

export default Haste;
