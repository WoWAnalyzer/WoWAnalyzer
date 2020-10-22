import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { AIMED_SHOT_BASELINE_CAST_TIME, STREAMLINE_AIMED_SHOT_CAST_SPEED_UP, STREAMLINE_RAPID_FIRE_DAMAGE_INCREASE, TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP } from 'parser/hunter/marksmanship/constants';
import ItemDamageDone from 'interface/ItemDamageDone';
import Haste from 'parser/shared/modules/Haste';
import { formatNumber } from 'common/format';

/**
 * Rapid Fire's damage is increased by 15%.
 * Rapid Fire also causes your next Aimed Shot to cast 30% faster.
 *
 * Example log:
 *
 */
class Streamline extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  damage: number = 0;
  aimedShotCastTimeSaved: number = 0;

  protected haste!: Haste;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STREAMLINE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE_DAMAGE), this.onRapidFireDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT), this.onAimedShotCast);
  }

  onRapidFireDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, STREAMLINE_RAPID_FIRE_DAMAGE_INCREASE);
  }

  onAimedShotCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STREAMLINE_BUFF.id)) {
      return;
    }
    /** Lock and Load suppresses streamline consumption so it's not possible to waste the decreased casting time from Streamline */
    if(this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id)) {
      return;
    }
    const hastepercent = this.haste.current;
    const trueshotIncrease = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id) ? (1 + TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP) : 1;
    const aimedShotCastTime = AIMED_SHOT_BASELINE_CAST_TIME / (1 + hastepercent) / trueshotIncrease;
    this.aimedShotCastTimeSaved += aimedShotCastTime - (aimedShotCastTime / (1 + STREAMLINE_AIMED_SHOT_CAST_SPEED_UP));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You saved {formatNumber(this.aimedShotCastTimeSaved / 1000)} seconds of Aimed Shot cast time through Streamline
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.STREAMLINE_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Streamline;
