import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BASE_RECKLESSNESS_DURATION = 10 * 1000; // 10 seconds;

// Example log: https://www.warcraftlogs.com/reports/q3gKvAx6TCaMLyFb#fight=22&type=damage-done&source=28
class RecklessAbandon extends Analyzer {
  damage: number = 0;
  instantRageGained: number = 0;
  rageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.RECKLESSNESS_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.RECKLESSNESS),
      this.onRecklessAbandonEnergize,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).to(SELECTED_PLAYER),
      this.onPlayerEnergize,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  hasLast4SecondsOfRecklessness(event: ResourceChangeEvent | DamageEvent) {
    const reck = this.selectedCombatant.getBuff(SPELLS.RECKLESSNESS.id);
    return reck && event.timestamp - reck.start > BASE_RECKLESSNESS_DURATION;
  }

  onRecklessAbandonEnergize(event: ResourceChangeEvent) {
    this.instantRageGained += event.resourceChange;
  }

  onPlayerEnergize(event: ResourceChangeEvent) {
    if (this.hasLast4SecondsOfRecklessness(event)) {
      this.rageGained += event.resourceChange / 2;
    }
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.hasLast4SecondsOfRecklessness(event)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            In the 4 additional seconds of Recklessness caused by Reckless Abandon:
            <br />
            Additional rage generated: <strong>{this.rageGained}</strong>
            <br />
            Damage dealt:{' '}
            <strong>
              {formatNumber(this.damage)} ({formatPercentage(this.damagePercent)}%)
            </strong>
          </>
        }
      >
        <BoringSpellValueText spellId={talents.RECKLESSNESS_TALENT.id}>
          <>{formatNumber(this.instantRageGained)} instant rage</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RecklessAbandon;
