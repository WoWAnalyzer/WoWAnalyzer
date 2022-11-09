import {
  SURGING_SHOTS_DAMAGE_INCREASE,
  SURGING_SHOTS_RESET_CHANCE,
} from 'analysis/retail/hunter/marksmanship/constants';
import SpellUsable from 'analysis/retail/hunter/marksmanship/modules/core/SpellUsable';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Rapid Fire deals 25% additional damage, and Aimed Shot has a 15% chance to reset the cooldown of Rapid Fire.
 *
 * Example log:
 *
 */
class SurgingShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  damage = 0;
  aimedShotCasts = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.SURGING_SHOTS_EFFECT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE),
      this.onRapidFireDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT),
      this.onAimedShotCast,
    );
  }

  onRapidFireDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, SURGING_SHOTS_DAMAGE_INCREASE);
  }

  onAimedShotCast() {
    this.aimedShotCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        dropdown={
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(
                this.spellUsable.rapidFireResets,
                this.aimedShotCasts,
                SURGING_SHOTS_RESET_CHANCE,
              )}
              <p>
                Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given
                your number of <SpellLink id={SPELLS.AIMED_SHOT.id} /> casts.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SURGING_SHOTS_EFFECT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgingShots;
