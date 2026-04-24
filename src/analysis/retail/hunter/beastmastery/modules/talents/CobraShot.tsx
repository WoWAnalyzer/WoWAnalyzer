import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FreeCastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { COBRA_SHOT_KC_CDR_MS } from '../../constants';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 */

class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReductionMs = 0;
  wastedReductionMs = 0;
  wastedCasts = 0;
  casts = 0;
  cobraShotCDR = COBRA_SHOT_KC_CDR_MS;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COBRA_SHOT_TALENT);

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
    return Math.max(this.casts * this.cobraShotCDR, 1);
  }

  onCobraShotCast(event: CastEvent) {
    this.casts += 1;
    if (!this.spellUsable.isOnCooldown(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id)) {
      this.wastedCasts++;
      return;
    }

    this.effectiveReductionMs += this.spellUsable.reduceCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
      this.cobraShotCDR,
    );
  }

  onCobraShotFreeCast(event: FreeCastEvent) {
    this.spellUsable.reduceCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
      this.cobraShotCDR,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        tooltip={
          this.wastedCasts > 0 && (
            <>
              You had {this.wastedCasts} {this.wastedCasts > 1 ? 'casts' : 'cast'} of Cobra Shot
              when Kill Command wasn't on cooldown.
            </>
          )
        }
      >
        <BoringSpellValueText spell={TALENTS.COBRA_SHOT_TALENT}>
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

export default CobraShot;
