import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { MASTER_HANDLER_CDR_MS } from '../../constants';

/**
 * Each time Barbed Shot deals damage, the cooldown of Kill Command is reduced by 0.50 sec.
 */
class MasterHandler extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReductionMs = 0;
  ticks = 0;
  readonly masterHandlerCDR = MASTER_HANDLER_CDR_MS;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MASTER_HANDLER_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.BARBED_SHOT_TALENT),
      this.onBarbedShotTick,
    );
  }

  get totalPossibleCDR() {
    return Math.max(this.ticks * this.masterHandlerCDR, 1);
  }

  onBarbedShotTick(event: DamageEvent) {
    this.ticks += 1;

    if (!this.spellUsable.isOnCooldown(TALENTS.BARBED_SHOT_TALENT.id)) {
      return;
    }

    this.effectiveReductionMs += this.spellUsable.reduceCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
      this.masterHandlerCDR,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.MASTER_HANDLER_TALENT}>
          {formatNumber(this.effectiveReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s{' '}
          <small>effective CDR</small>
          <p />
          {formatPercentage(this.effectiveReductionMs / this.totalPossibleCDR)}%{' '}
          <small>effectiveness</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterHandler;
