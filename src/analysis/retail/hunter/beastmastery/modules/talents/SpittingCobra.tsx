import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SPITTING_COBRA_DAMAGE_INCREASE } from '../../constants';

/**
 *
 * When Bestial Wrath ends, summon a Spitting Cobra to aid you in combat for 15 sec.
 * Each Cobra Shot used during Bestial Wrath increases the damage this Spitting Cobra deals by 10%.
 *
 * Example log:
 *
 */

class SpittingCobra extends Analyzer {
  damage = 0;
  casts = 0;
  totalIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BESTIAL_WRATH, SPELLS.COBRA_SHOT]),
      this.bestialWrathCobraShotCasts,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SPITTING_COBRA_DAMAGE),
      this.spittingCobraDamage,
    );
  }

  get averageIncrease() {
    return (this.totalIncrease / this.casts).toFixed(1);
  }

  bestialWrathCobraShotCasts(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BESTIAL_WRATH.id) {
      this.casts += 1;
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    this.totalIncrease += SPITTING_COBRA_DAMAGE_INCREASE;
  }

  spittingCobraDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.SPITTING_COBRA_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            {this.averageIncrease}% <small>average damage increase</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SpittingCobra;
