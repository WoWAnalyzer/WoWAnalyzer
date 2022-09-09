import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

export default class CharredWarblades extends Analyzer {
  heal = 0;
  factor = 0;
  rank = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_DEMON_HUNTER.CHARRED_WARBLADES_TALENT.id,
    );
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHARRED_WARBLADES),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.heal += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This shows the extra hps that the conduit provides.
            <br />
            <strong>Total extra healing:</strong> {formatNumber(this.heal)}
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.CHARRED_WARBLADES_TALENT.id}>
          <ItemHealingDone amount={this.heal} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
