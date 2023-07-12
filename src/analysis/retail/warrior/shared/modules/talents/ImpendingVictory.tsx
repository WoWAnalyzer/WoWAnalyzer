import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/warrior';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';

class ImpendingVictory extends Analyzer {
  private totalHealing = 0;
  private overhealing = 0;
  private totalCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.IMPENDING_VICTORY_TALENT_HEAL),
      this.recordHealing,
    );
  }

  private recordHealing(event: HealEvent) {
    this.totalHealing += event.amount;
    this.overhealing += event.overheal || 0;
    this.totalCasts += 1;
  }

  get overhealPercentage() {
    if (this.overhealing === 0) {
      return 0;
    }
    return this.overhealing / (this.totalHealing + this.overhealing);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>You used Impending Victory a total of {this.totalCasts} times.</>}
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.IMPENDING_VICTORY_TALENT} /> Healing done
            </>
          }
        >
          <>
            {formatNumber(this.totalHealing)} <small> Healing </small>
            <br />
            {formatPercentage(this.overhealPercentage)}% <small> overheal </small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ImpendingVictory;
