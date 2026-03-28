import RapidFire from 'analysis/retail/hunter/marksmanship/modules/talents/RapidFire';
import SteadyShot from 'analysis/retail/hunter/marksmanship/modules/spells/SteadyShot';
import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
/**
 * Trueshot - MM Hunter main cooldown.
 * Tracks:
 * - Average Aimed Shots per Trueshot window
 * - Average Moonlight Chakram casts per Trueshot window (Sentinel only)
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=auras&source=25&ability=288613
 */
class Trueshot extends Analyzer {
  static dependencies = {
    rapidFire: RapidFire,
    steadyShot: SteadyShot,
  };
  trueshotCasts = 0;
  aimedShotsPrTS = 0;
  moonlightChakramPrTS = 0;
  isSentinel = false;
  protected rapidFire!: RapidFire;
  protected steadyShot!: SteadyShot;
  constructor(options: Options) {
    super(options);
    this.isSentinel = this.selectedCombatant.hasTalent(TALENTS_HUNTER.SENTINEL_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedShotCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.TRUESHOT_TALENT),
      this.onTrueshotCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONLIGHT_CHAKRAM_CAST),
      this.onMoonlightChakramCast,
    );
  }
  get averageAimedShots() {
    const avg = this.aimedShotsPrTS / this.trueshotCasts;
    return isNaN(avg) || !isFinite(avg) ? 0 : avg;
  }
  get averageMoonlightChakram() {
    const avg = this.moonlightChakramPrTS / this.trueshotCasts;
    return isNaN(avg) || !isFinite(avg) ? 0 : avg;
  }
  onTrueshotCast() {
    this.trueshotCasts += 1;
  }
  onAimedShotCast() {
    if (this.selectedCombatant.hasBuff(TALENTS_HUNTER.TRUESHOT_TALENT.id)) {
      this.aimedShotsPrTS += 1;
    }
  }
  onMoonlightChakramCast() {
    if (this.selectedCombatant.hasBuff(TALENTS_HUNTER.TRUESHOT_TALENT.id)) {
      this.moonlightChakramPrTS += 1;
    }
  }
  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)} size="flexible">
        <BoringSpellValueText spell={TALENTS_HUNTER.TRUESHOT_TALENT}>
          <SpellIcon spell={TALENTS_HUNTER.AIMED_SHOT_TALENT} noLink />{' '}
          {this.averageAimedShots.toFixed(1)} <small>Aimed Shots per Trueshot</small>
          {this.isSentinel && (
            <>
              <br />
              <SpellIcon spell={SPELLS.MOONLIGHT_CHAKRAM_CAST} noLink />{' '}
              {this.averageMoonlightChakram.toFixed(1)} <small>Moonlight Chakram per Trueshot</small>
            </>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default Trueshot;
