import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Voracious extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VORACIOUS_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.VORACIOUS.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.VORACIOUS_TALENT.id}>
          <Trans id="deathknight.blood.voracious.statistic">
            <Uptime /> {formatPercentage(this.uptime)}% <small>Uptime</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Voracious;
