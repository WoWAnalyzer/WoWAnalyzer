import {
  SURGING_SHOTS_DAMAGE_INCREASE,
  SURGING_SHOTS_RESET_CHANCE,
} from 'analysis/retail/hunter/marksmanship/constants';
import SpellUsable from 'analysis/retail/hunter/marksmanship/modules/core/SpellUsable';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
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
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGING_SHOTS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE),
      this.onRapidFireDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AIMED_SHOT_TALENT),
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
        category={STATISTIC_CATEGORY.TALENTS}
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
                your number of <SpellLink spell={TALENTS.AIMED_SHOT_TALENT} /> casts.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.SURGING_SHOTS_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgingShots;
