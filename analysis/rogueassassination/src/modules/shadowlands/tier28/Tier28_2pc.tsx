import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
// import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
// import Statistic from 'parser/ui/Statistic';
// import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
// import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Assassination Rogue Tier 28 - 2pc - Grudge Match
 * Shiv causes enemies within 15 yards to take 40% increased damage from your Poisons and Bleeds for 9 seconds
 */

const POISON_BLEED_DOTS = [
  SPELLS.GARROTE,
  SPELLS.RUPTURE,
  SPELLS.DEADLY_POISON,
  SPELLS.DEADLY_POISON_DOT,
  SPELLS.DEADLY_POISON_PROC,
  SPELLS.SEPSIS,
  SPELLS.EXSANGUINATE_TALENT,
  SPELLS.WOUND_POISON,
  SPELLS.SERRATED_BONE_SPIKE,
];

class Tier28_2pc extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  bonusDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2Piece();

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(POISON_BLEED_DOTS),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    // const enemy = this.enemies.getEntity(event);
  }
}

export default Tier28_2pc;
