import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
/**
 * Moonlight Chakram - Sentinel hero talent ability.
 * During Trueshot, the Trueshot button transforms into Moonlight Chakram.
 * You get exactly one use per Trueshot window ΓÇö it should always be used.
 *
 * This analyzer tracks:
 * - Trueshot windows where Moonlight Chakram was NOT cast (wasted)
 * - Moonlight Chakram casts outside of Trueshot (also wasteful ΓÇö it
 *   should replace Trueshot, not be cast independently)
 */
class MoonlightChakram extends Analyzer {
  trueshotWindows = 0;
  chakramCastsInTrueshot = 0;
  chakramCastsOutsideTrueshot = 0;
  constructor(options: Options) {
    super(options);
    // Only active for Sentinel hero talent
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.SENTINEL_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.TRUESHOT_TALENT),
      this.onTrueshotCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONLIGHT_CHAKRAM_CAST),
      this.onChakramCast,
    );
  }
  onTrueshotCast() {
    this.trueshotWindows += 1;
  }
  onChakramCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS_HUNTER.TRUESHOT_TALENT.id)) {
      this.chakramCastsInTrueshot += 1;
    } else {
      this.chakramCastsOutsideTrueshot += 1;
      addInefficientCastReason(event, 'Moonlight Chakram cast outside of Trueshot window.');
    }
  }
  get missedChakrams() {
    return Math.max(0, this.trueshotWindows - this.chakramCastsInTrueshot);
  }
  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(3)} size="flexible">
        <BoringSpellValueText spell={SPELLS.MOONLIGHT_CHAKRAM_CAST}>
          {this.chakramCastsInTrueshot}/{this.trueshotWindows}{' '}
          <small>Trueshot windows with Moonlight Chakram</small>
          {this.missedChakrams > 0 && (
            <>
              <br />
              <span style={{ color: 'red' }}>{this.missedChakrams}</span>{' '}
              <small>missed</small>
            </>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default MoonlightChakram;
