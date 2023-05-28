import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const FORCEFUL_WINDS = {
  INCREASE_PER_STACK: 0.5,
};

/**
 * Windfury causes each successive Windfury attack within 15 sec to
 * increase the damage of Windfury by 50%, stacking up to 5 times.
 */
class ForcefulWinds extends Analyzer {
  protected damageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.FORCEFUL_WINDS_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WINDFURY_ATTACK),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    const buff: any = this.selectedCombatant.getBuff(SPELLS.FORCEFUL_WINDS_BUFF.id);
    if (!buff) {
      return;
    }
    const stacks = buff.stacks || 0;
    this.damageGained += calculateEffectiveDamage(
      event,
      stacks * FORCEFUL_WINDS.INCREASE_PER_STACK,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.FORCEFUL_WINDS_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ForcefulWinds;
