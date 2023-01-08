import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class IdolOfCthun extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IDOL_OF_CTHUN_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.IDOL_OF_CTHUN_MIND_FLAY_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.IDOL_OF_CTHUN_MIND_SEAR_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.IDOL_OF_CTHUN_TALENT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IdolOfCthun;
