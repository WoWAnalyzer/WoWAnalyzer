import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

class Pestilence extends Analyzer {
  private totalCasts = 0;
  private totalDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PESTILENCE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PESTILENCE), this.onCast);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PESTILENCE),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    this.totalCasts += 1;
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  get castsPerMinute(): number {
    return this.totalCasts / (this.owner.fightDuration / 1000 / 60);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Pestilence consumes your plagues and deals their remaining damage instantly, also granting a charge of Putrefy.`}
        position={STATISTIC_ORDER.CORE(11)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.PESTILENCE}>
          <>
            {this.totalCasts} <small>casts</small>
            <br />
            {this.castsPerMinute.toFixed(1)} <small>CPM</small>
            <br />
            <ItemDamageDone amount={this.totalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Pestilence;
