import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class SoulRot extends Analyzer {
  _soulRotDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SOUL_ROT),
      this.onRotDamage,
    );
  }

  onRotDamage(event: DamageEvent) {
    this._soulRotDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.SOUL_ROT.id}>
          {this.owner.formatItemDamageDone(this._soulRotDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulRot;
