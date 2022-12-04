import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Events, { CastEvent } from 'parser/core/Events';
import { getSpiritBombSoulConsumptions } from 'analysis/retail/demonhunter/vengeance/normalizers/SpiritBombEventLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';

export default class SpiritBomb extends Analyzer {
  private soulsConsumedByAmount = Array.from({ length: 6 }, () => 0);
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const amountOfStacksConsumed = getSpiritBombSoulConsumptions(event).length;
    this.soulsConsumedByAmount[amountOfStacksConsumed] += 1;
  }

  get totalGoodCasts() {
    return this.soulsConsumedByAmount[4] + this.soulsConsumedByAmount[5];
  }

  get totalCasts() {
    return Object.values(this.soulsConsumedByAmount).reduce((total, casts) => total + casts, 0);
  }

  get percentGoodCasts() {
    return this.totalGoodCasts / this.totalCasts;
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.percentGoodCasts,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (!this.totalCasts) {
      return null;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.soulsConsumedByAmount).map((castAmount, stackAmount) => (
                  <tr key={stackAmount}>
                    <th>{stackAmount}</th>
                    <td>{castAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT}>
          {formatPercentage(this.percentGoodCasts)}% <small>good casts</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
