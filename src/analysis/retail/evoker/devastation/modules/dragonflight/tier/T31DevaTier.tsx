import SPELLS from 'common/SPELLS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { DEVA_T31_2PC_MULTIPLER } from '../../../constants';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { TIERS } from 'game/TIERS';

/**
 * (2) Set Devastation: While Dragonrage is active
 * you gain Emerald Trance every 6 sec, increasing your
 * damage done by 5%, stacking up to 5 times.
 *
 * (4) Set Devastation: When Dragonrage ends,
 * Emerald Trance persists for 5 sec per stack
 * and grants you Essence Burst every 5 sec.
 */
class T31DevaTier extends Analyzer {
  ampedDamage: number = 0;
  /** We need this so we don't assume always 5 stacks
   * Since technically you can drop Dragonrage early
   * and then the buff won't be fully stacked */
  buffStacks: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T31);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), (event) => {
      this.onHit(event);
    });
  }

  onHit(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.EMERALD_TRANCE_T31_2PC_BUFF_STACKING.id) &&
      !this.selectedCombatant.hasBuff(SPELLS.EMERALD_TRANCE_T31_2PC_BUFF.id)
    ) {
      return;
    }
    // Post Dragonrage Buff
    if (this.selectedCombatant.hasBuff(SPELLS.EMERALD_TRANCE_T31_2PC_BUFF.id)) {
      this.ampedDamage += calculateEffectiveDamage(event, DEVA_T31_2PC_MULTIPLER * this.buffStacks);
      return;
    }
    // During Dragonrage Buff
    this.buffStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.EMERALD_TRANCE_T31_2PC_BUFF_STACKING.id,
    );
    this.ampedDamage += calculateEffectiveDamage(event, DEVA_T31_2PC_MULTIPLER * this.buffStacks);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringValueText label="Emerald Dream (T31 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemDamageDone amount={this.ampedDamage} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T31DevaTier;
