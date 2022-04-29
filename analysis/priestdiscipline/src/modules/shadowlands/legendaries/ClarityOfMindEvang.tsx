// import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
// import Events, { DamageEvent, HealEvent, Ability } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../../core/AtonementAnalyzer';

// const CLARITY_EXTENSION_DURATION = 6000;

class ClarityOfMindEvang extends Analyzer {
  private atonementHealing: number = 0;
  private healingMap: Map<number, number> = new Map();
  // private abilityMap: Map<number, Ability> = new Map();

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasLegendary(SPELLS.CLARITY_OF_MIND) &&
      this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
  }

  private handleAtone(event: AtonementAnalyzerEvent) {
    const { expirationDelta } = event;
    console.log(expirationDelta);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>Bonus Atonement Healing:</strong>
            <br />
            <strong>Direct Healing:</strong>
            <br />
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={SPELLS.CLARITY_OF_MIND.id}>
            <ItemHealingDone amount={0} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ClarityOfMindEvang;
