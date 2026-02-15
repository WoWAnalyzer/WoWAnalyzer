import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { WILDFIRE_SHELLS_CDR_PER_TICK, WILDFIRE_SHELLS_TICK_COOLDOWN } from '../../constants';

/**
 * Wildfire Shells
 *
 * Boomstick reduces the cooldown of Wildfire Bomb by 2s each time it deals damage,
 * up to 8s per cast (once per tick, 4 ticks max).
 */
class WildfireShells extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private lastTickTimestamp = 0;
  private ticksThisCast = 0;
  private effectiveCDR = 0;
  private wastedCDR = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_SHELLS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BOOMSTICK_DAMAGE),
      this.onBoomstickDamage,
    );
  }

  private onBoomstickDamage = (event: DamageEvent) => {
    // 100 ms internal cooldown on CDR. ie 2s per blast
    if (event.timestamp - this.lastTickTimestamp < WILDFIRE_SHELLS_TICK_COOLDOWN) {
      return;
    }

    this.lastTickTimestamp = event.timestamp;
    this.ticksThisCast += 1;

    const effective = this.deps.spellUsable.reduceCooldown(
      TALENTS.WILDFIRE_BOMB_TALENT.id,
      WILDFIRE_SHELLS_CDR_PER_TICK,
    );
    this.effectiveCDR += effective;
    this.wastedCDR += WILDFIRE_SHELLS_CDR_PER_TICK - effective;
  };

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Wildfire Shells reduced Wildfire Bomb's cooldown by{' '}
            <strong>{(this.effectiveCDR / 1000).toFixed(1)}s</strong> total.
            <br />
            <strong>{(this.wastedCDR / 1000).toFixed(1)}s</strong> was wasted (Wildfire Bomb not on
            cooldown).
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.WILDFIRE_SHELLS_TALENT}>
          <>
            {(this.effectiveCDR / 1000).toFixed(1)}s <small>CDR gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildfireShells;
