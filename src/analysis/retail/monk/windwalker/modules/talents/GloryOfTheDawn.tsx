import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class GloryOfTheDawn extends Analyzer {
  totalHits = 0;
  critHits = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.GLORY_OF_THE_DAWN_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GLORY_OF_THE_DAWN_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.totalHits += 1;

    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    if (isCrit) {
      this.critHits += 1;
    }
  }

  get critRate() {
    return this.totalHits > 0 ? this.critHits / this.totalHits : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_MONK.GLORY_OF_THE_DAWN_TALENT}>
          <div>
            {formatPercentage(this.critRate, 0)}% <small>Crit rate</small>
          </div>
          <div>
            {this.critHits} / {this.totalHits} <small>Crits / Hits</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GloryOfTheDawn;
