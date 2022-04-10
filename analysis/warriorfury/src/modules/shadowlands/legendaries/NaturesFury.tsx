import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class NaturesFury extends Analyzer {
  _ancientAftershockDamage: number = 0;
  _naturesFuryDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.NATURES_FURY);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.NATURES_FURY_DAMAGE),
      this.onNaturesFuryDamage,
    );
  }

  onNaturesFuryDamage(event: DamageEvent) {
    this._naturesFuryDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.NATURES_FURY_DAMAGE.id}>
          {this.owner.formatItemDamageDone(this._naturesFuryDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturesFury;
