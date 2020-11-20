import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/hunter/marksmanship/modules/core/SpellUsable';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SURGING_SHOTS_DAMAGE_INCREASE, SURGING_SHOTS_RESET_CHANCE } from 'parser/hunter/marksmanship/constants';

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
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SURGING_SHOTS_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE), this.onRapidFireDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.onAimedShotCast);
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
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.spellUsable.rapidFireResets, this.aimedShotCasts, SURGING_SHOTS_RESET_CHANCE)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.AIMED_SHOT.id} /> casts.</p>
            </div>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SURGING_SHOTS_EFFECT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgingShots;
