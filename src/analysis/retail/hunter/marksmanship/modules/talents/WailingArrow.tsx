import { Trans } from '@lingui/react/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { MS_BUFFER_50 } from 'analysis/retail/hunter/shared/constants';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { BadColor } from 'interface/guide';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Wailing Dead (Dark Ranger hero talent) makes Wailing Arrow castable once per Trueshot.
 * It guarantees a Deathblow proc, so casting it while a Deathblow proc is already up wastes
 * the guaranteed proc. It should also be cast exactly once during every Trueshot window.
 */
class WailingArrow extends Analyzer {
  totalCasts = 0;
  wastedIntoDeathblow = 0;
  trueshotsWithoutCast = 0;
  private castDuringCurrentTrueshot = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.WAILING_DEAD_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.TRUESHOT_TALENT),
      this.onTrueshotStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.TRUESHOT_TALENT),
      this.onTrueshotEnd,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WAILING_ARROW_DAMAGE),
      this.onCast,
    );
  }

  onTrueshotStart() {
    this.castDuringCurrentTrueshot = false;
  }

  onTrueshotEnd() {
    if (!this.castDuringCurrentTrueshot) {
      this.trueshotsWithoutCast += 1;
    }
  }

  onCast(event: CastEvent) {
    this.totalCasts += 1;
    this.castDuringCurrentTrueshot = true;
    if (this.selectedCombatant.hasBuff(SPELLS.DEATHBLOW_BUFF.id, event.timestamp, 0, MS_BUFFER_50)) {
      this.wastedIntoDeathblow += 1;
      addInefficientCastReason(
        event,
        <Trans id="hunter.marksmanship.modules.talents.wailingArrow.wastedDeathblow">
          You already had a Deathblow proc active. Wailing Arrow guarantees a Deathblow, so this
          cast wasted the guaranteed proc.
        </Trans>,
      );
    }
  }

  onFightEnd() {
    if (
      !this.castDuringCurrentTrueshot &&
      this.selectedCombatant.hasBuff(TALENTS_HUNTER.TRUESHOT_TALENT.id)
    ) {
      this.trueshotsWithoutCast += 1;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(14)} size="flexible">
        <BoringSpellValueText spell={SPELLS.WAILING_ARROW_DAMAGE}>
          <div>
            {this.totalCasts} <small>casts</small>
          </div>
          {this.wastedIntoDeathblow > 0 && (
            <div style={{ color: BadColor }}>
              {this.wastedIntoDeathblow} <small>cast into an existing Deathblow</small>
            </div>
          )}
          {this.trueshotsWithoutCast > 0 && (
            <div style={{ color: BadColor }}>
              {this.trueshotsWithoutCast} <small>Trueshot(s) without a Wailing Arrow cast</small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WailingArrow;
