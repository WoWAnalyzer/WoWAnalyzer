import { ECHOING_CALL_INCREASED_WILD_CALL_CHANCE } from 'analysis/retail/hunter/beastmastery/constants';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Wild Call has a x%  increased chance to reset the cooldown of Barbed Shot.
 *
 * Example log
 *
 */
class EchoingCall extends Analyzer {
  conduitRank: number = 0;
  procChances: number = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ECHOING_CALL_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

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
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            Since there is no way to track Wild Call resets, this is an approximation of how many
            resets Echoing Call granted you.
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.ECHOING_CALL_CONDUIT.id} rank={this.conduitRank}>
          <>
            ≈
            {(this.procChances * ECHOING_CALL_INCREASED_WILD_CALL_CHANCE[this.conduitRank]).toFixed(
              1,
            )}{' '}
            <small>resets</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default EchoingCall;
