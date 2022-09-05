import { SHATTERED_RESTORATION_SCALING } from 'analysis/retail/demonhunter';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

export default class ShatteredRestoration extends Analyzer {
  heal = 0;
  factor = 0;
  rank = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.SHATTERED_RESTORATION.id);

    if (!this.active) {
      return;
    }

    this.rank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SHATTERED_RESTORATION.id);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CONSUME_SOUL_VDH),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.heal += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const effectiveHealing =
      this.heal - (this.heal / (100 + SHATTERED_RESTORATION_SCALING[this.rank])) * 100;

    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        tooltip={
          <>
            This shows the extra hps that the conduit provides.
            <br />
            <strong>Total extra healing:</strong> {formatNumber(effectiveHealing)}
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.SHATTERED_RESTORATION.id} rank={this.rank}>
          <ItemHealingDone amount={effectiveHealing} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}
