import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DecimatingBolt extends Analyzer {
  _decimatingBoltDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DECIMATING_BOLT_HIT),
      this.onBoltDamage,
    );
  }

  onBoltDamage(event: DamageEvent) {
    this._decimatingBoltDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.DECIMATING_BOLT_HIT.id}>
          {this.owner.formatItemDamageDone(this._decimatingBoltDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DecimatingBolt;
