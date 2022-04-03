import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class AncientAftershock extends Analyzer {
  _ancientAftershockDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ANCIENT_AFTERSHOCK, SPELLS.ANCIENT_AFTERSHOCK_DOT]),
      this.onAftershockDamage,
    );
  }

  onAftershockDamage(event: DamageEvent) {
    this._ancientAftershockDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.ANCIENT_AFTERSHOCK.id}>
          {this.owner.formatItemDamageDone(this._ancientAftershockDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AncientAftershock;
