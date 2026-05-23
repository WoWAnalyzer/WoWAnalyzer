import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { WAR_ORDERS_CDR_MS } from '../../constants';

/**
 * Barbed Shot deals 10% increased damage, and
 * applying Barbed Shot reduces the cooldown of Kill Command by 3.0 sec.
 */
class WarOrders extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReductionMs = 0;
  wastedReductionMs = 0;
  wastedCasts = 0;
  casts = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WAR_ORDERS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BARBED_SHOT_TALENT),
      this.onBarbedShotCast,
    );
  }

  get totalPossibleCDR() {
    return Math.max(this.casts * WAR_ORDERS_CDR_MS, 1);
  }

  onBarbedShotCast(event: CastEvent) {
    this.casts += 1;

    if (!this.spellUsable.isOnCooldown(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id)) {
      this.wastedCasts += 1;
      return;
    }

    this.effectiveReductionMs += this.spellUsable.reduceCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
      WAR_ORDERS_CDR_MS,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.WAR_ORDERS_TALENT}>
          <>
            {formatNumber(this.effectiveReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s{' '}
            <small>effective CDR</small>
            <p />
            {formatPercentage(this.effectiveReductionMs / this.totalPossibleCDR)}%{' '}
            <small>effectiveness</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WarOrders;
