import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ChampionsSpear extends Analyzer {
  _spearOfBastionDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CHAMPIONS_SPEAR_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHAMPIONS_SPEAR),
      this.onSpearDamage,
    );
  }

  onSpearDamage(event: DamageEvent) {
    this._spearOfBastionDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.CHAMPIONS_SPEAR_TALENT}>
          {this.owner.formatItemDamageDone(this._spearOfBastionDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChampionsSpear;
