import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FreeCastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { BARBED_SCALES_CDR_MS } from '../../constants';

/**
 * Casting Cobra Shot reduces the cooldown of Barbed Shot by 2 sec.
 */

class BarbedScales extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReductionMs = 0;
  wastedReductionMs = 0;
  wastedCasts = 0;
  casts = 0;
  cdr = BARBED_SCALES_CDR_MS;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BARBED_SCALES_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraShotCast,
    );

    this.addEventListener(
      Events.freecast.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraShotFreeCast,
    );
  }

  get totalPossibleCDR() {
    return Math.max(this.casts * this.cdr, 1);
  }

  onCobraShotCast(event: CastEvent) {
    this.casts += 1;

    if (!this.spellUsable.isOnCooldown(TALENTS.BARBED_SHOT_TALENT.id)) {
      this.wastedCasts += 1;
      return;
    }

    this.effectiveReductionMs += this.spellUsable.reduceCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
      this.cdr,
    );
  }

  onCobraShotFreeCast(event: FreeCastEvent) {
    this.spellUsable.reduceCooldown(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id, this.cdr);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.BARBED_SCALES_TALENT}>
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

export default BarbedScales;
