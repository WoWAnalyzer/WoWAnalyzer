import { formatThousands } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { GROWING_INFERNO_SCALING } from 'analysis/retail/demonhunter/havoc/constants';

export default class GrowingInferno extends Analyzer {
  addedDamage: number = 0;
  totalDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.GROWING_INFERNO_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          DH_SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE,
          DH_SPELLS.IMMOLATION_AURA_BUFF_DAMAGE,
        ]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
    // note that this is likely not entirely correct, but is a decent approximation
    this.addedDamage += calculateEffectiveDamage(
      event,
      GROWING_INFERNO_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS_DEMON_HUNTER.GROWING_INFERNO_TALENT)
      ],
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={<>Total damage of Immolation Aura {formatThousands(this.totalDamage)}</>}
      >
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.GROWING_INFERNO_TALENT.id}>
          <ItemDamageDone amount={this.addedDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
