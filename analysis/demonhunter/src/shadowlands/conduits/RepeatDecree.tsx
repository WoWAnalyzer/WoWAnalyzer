import { formatNumber } from 'common/format';
import DH_CONDUITS from 'common/SPELLS/shadowlands/conduits/demonhunter';
import DH_COVENANTS from 'common/SPELLS/shadowlands/covenants/demonhunter';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

export default class RepeatDecree extends Analyzer {
  damage = 0;
  rank = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(DH_CONDUITS.REPEAT_DECREE.id);

    if (!this.active) {
      return;
    }

    this.rank = this.selectedCombatant.conduitRankBySpellID(DH_CONDUITS.REPEAT_DECREE.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DH_COVENANTS.ELYSIAN_DECREE_REPEAT_DECREE_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        tooltip={
          <>
            This shows the extra dps that the conduit provides.
            <br />
            <strong>Total extra damage:</strong> {formatNumber(this.damage)}
          </>
        }
      >
        <ConduitSpellText spellId={DH_CONDUITS.REPEAT_DECREE.id} rank={this.rank}>
          <ItemDamageDone amount={this.damage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}
