import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * When your summoned Dreadstalkers fade away, they increase the damage of your Demonbolt by 10% for 8 sec.
 */

class ShadowsBite extends Analyzer {
  _totalDemonboltCasts: number = 0;
  _buffedDemonboltCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.SHADOWS_BITE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONBOLT),
      this.onDemonboltCast,
    );
  }

  onDemonboltCast(event: CastEvent) {
    this._totalDemonboltCasts += 1;

    if (this.selectedCombatant.hasBuff(SPELLS.SHADOWS_BITE_BUFF.id, event.timestamp)) {
      this._buffedDemonboltCasts += 1;
    }
  }

  get totalDemonboltCasts() {
    return this._totalDemonboltCasts;
  }

  get buffedDemonboltCasts() {
    return this._buffedDemonboltCasts;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS_WARLOCK.SHADOWS_BITE_TALENT}>
          {formatPercentage(this.buffedDemonboltCasts / this.totalDemonboltCasts, 0)}%{' '}
          <small> Demonbolt casts under Shadow&apos;s bite buff</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ShadowsBite;
