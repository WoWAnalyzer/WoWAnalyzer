import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DampenHarm extends Analyzer {
  hitsReduced = 0;
  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id)) {
      this.active = false;
      return;
    }
    this.addEventListener(
      Events.damage.to(SELECTED_PLAYER), this.damageReduction,
    );
  }

  damageReduction(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DAMPEN_HARM_TALENT.id)) {
      this.hitsReduced += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(90)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.DAMPEN_HARM_TALENT.id}>
          hi this is some text
          <br/>
          <ItemDamageDone amount={this.hitsReduced}/>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DampenHarm;