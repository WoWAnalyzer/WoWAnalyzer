import RapidFire from 'analysis/retail/hunter/marksmanship/modules/spells/RapidFire';
import SteadyShot from 'analysis/retail/hunter/marksmanship/modules/spells/SteadyShot';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Critical strike chance increased by 10% and critical strike damage increased by 20%. The cooldown of Aimed Shot and Rapid Fire is reduced by 60%.
 * Lasts 15 sec.
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

  protected rapidFire!: RapidFire;
  protected steadyShot!: SteadyShot;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedShotCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT),
      this.onTrueshotCast,
    );
  }

  get averageAimedShots() {
    const averageAimedShots = this.aimedShotsPrTS / this.trueshotCasts;
    return isNaN(averageAimedShots) || !isFinite(averageAimedShots) ? 0 : averageAimedShots;
  }

  onTrueshotCast() {
    this.trueshotCasts += 1;
  }

  onAimedShotCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      this.aimedShotsPrTS += 1;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(1)} size="flexible">
        <BoringSpellValueText spell={SPELLS.TRUESHOT}>
          <SpellIcon spell={TALENTS_HUNTER.AIMED_SHOT_TALENT} noLink />{' '}
          {this.averageAimedShots.toFixed(1)} <small>per Trueshot</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Trueshot;
