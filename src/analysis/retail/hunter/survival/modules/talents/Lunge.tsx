import { ONE_SECOND_IN_MS } from 'analysis/retail/hunter/shared/constants';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatDurationMillisMinSec } from 'common/format';

/**
 * Lunge reduces the remaining cooldown on Wildfire Bomb by 1.0 sec on auto-attack.
 *
 * Example logs:
 * https://www.warcraftlogs.com/reports/GcyfdwP1XTJrR3h7#fight=15&source=8&type=damage-done&ability=212436
 */

class Lunge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private reductionAtCurrentCast: number = 0;
  private effectiveReductionMs: number = 0;
  private wastedReductionMs: number = 0;
  private autoAttack: number = 0;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.LUNGE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.reductionAtCurrentCast += 1;
    if (this.spellUsable.isOnCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id)) {
      this.checkCooldown(TALENTS.WILDFIRE_BOMB_TALENT.id);
    } else {
      this.wastedReductionMs += ONE_SECOND_IN_MS;
    }
    this.autoAttack += 1;
  }

  checkCooldown(spellId: number) {
    if (this.spellUsable.cooldownRemaining(spellId) < ONE_SECOND_IN_MS) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, ONE_SECOND_IN_MS);
      this.effectiveReductionMs += effectiveReductionMs;
      this.wastedReductionMs += ONE_SECOND_IN_MS - effectiveReductionMs;
    } else {
      this.effectiveReductionMs += this.spellUsable.reduceCooldown(spellId, ONE_SECOND_IN_MS);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.LUNGE_TALENT}>
          <>
            {formatDurationMillisMinSec(this.effectiveReductionMs)}{' '}
            <small>cooldown reduction.</small>
            <br />
            {formatDurationMillisMinSec(this.wastedReductionMs)} <small>wasted.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Lunge;
