import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { When, ThresholdStyle, NumberThreshold } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Consecration extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  _hitsTaken: number = 0;
  _hitsMitigated: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onPlayerDamage);
  }

  onPlayerDamage(event: DamageEvent) {
    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    this._hitsTaken += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.CONSECRATION_BUFF.id)) {
      this._hitsMitigated += 1;
    }
  }

  get pctHitsMitigated(): number {
    return this._hitsMitigated / this._hitsTaken;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.pctHitsMitigated,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        'Your Consecration usage can be improved. Maintain it to reduce all incoming damage and refresh it during rotational downtime.',
      )
        .icon(SPELLS.CONSECRATION_CAST.icon)
        .actual(
          defineMessage({
            id: 'paladin.protection.suggestions.consecration.hitsMitigated',
            message: `${formatPercentage(actual)}% of hits were mitigated by Consecration`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(2)} size="flexible">
        <BoringSpellValue
          spell={SPELLS.CONSECRATION_CAST.id}
          value={`${formatPercentage(this.pctHitsMitigated)} %`}
          label="Hits Mitigated w/ Consecration"
        />
      </Statistic>
    );
  }
}

export default Consecration;
