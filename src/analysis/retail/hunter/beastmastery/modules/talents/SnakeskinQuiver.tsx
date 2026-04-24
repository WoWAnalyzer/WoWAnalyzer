import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SPELLS from 'common/SPELLS';
import {
  MS_BUFFER_1500,
  MS_BUFFER_500,
  SNAKESKIN_QUIVER_PROBABILITY,
} from 'analysis/retail/hunter/shared/constants';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 */

class SnakeskinQuiver extends Analyzer {
  casts = 0;
  autoAttacks = 0;
  readonly cobraShotLookBack = MS_BUFFER_1500;
  readonly autoShotLookBack = MS_BUFFER_500;
  lastCobraShot?: number;
  lastAutoShot?: number;
  readonly probability = SNAKESKIN_QUIVER_PROBABILITY;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SNAKESKIN_QUIVER_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraShotCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraShotDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT),
      this.onAutoShot,
    );
  }

  onCobraShotCast(event: CastEvent) {
    this.lastCobraShot = event.timestamp;
  }

  onCobraShotDamage(event: DamageEvent) {
    if (this.lastCobraShot === undefined || this.lastAutoShot === undefined) {
      return;
    }

    // look back the last cobra shot and check if it wasn't recent
    // and check for the recent autohit.
    if (
      event.timestamp - this.lastCobraShot > this.cobraShotLookBack &&
      event.timestamp - this.lastAutoShot < this.autoShotLookBack
    ) {
      this.casts++;
    }
  }

  onAutoShot(event: DamageEvent) {
    this.lastAutoShot = event.timestamp;
    this.autoAttacks++;
  }

  statistic() {
    console.debug('Statistic', this.casts, this.autoAttacks);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.casts, this.autoAttacks, this.probability)}
              <p>
                Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given
                your number of <SpellLink spell={SPELLS.AUTO_SHOT} />.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.SNAKESKIN_QUIVER_TALENT}>
          {this.casts} <small>casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SnakeskinQuiver;
