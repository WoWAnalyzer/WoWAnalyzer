import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { WILD_CALL_RESET_PERCENT } from '../../constants';

/**
 * Wild Call has a 20% increased chance to reset the cooldown of Barbed Shot.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/y8RkxqLapwWhBAjT#fight=6&type=damage-done&source=142
 *
 * Wild Call: Your auto shot critical strikes have a 20% chance to reset the cooldown of Barbed Shot.
 */

class OneWithThePack extends Analyzer {
  procChances = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ONE_WITH_THE_PACK_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT),
      this.onAutoShotDamage,
    );
  }

  onAutoShotDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.procChances += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Since there is no way to track Wild Call resets, this is an approximation of how many
            resets One With The Pack granted you.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ONE_WITH_THE_PACK_TALENT.id}>
          <>
            ≈{(this.procChances * WILD_CALL_RESET_PERCENT).toFixed(1)} <small>resets</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default OneWithThePack;
