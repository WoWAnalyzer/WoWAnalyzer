import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

class BurnToAshes extends Analyzer {
  static buffId = SPELLS.BURN_TO_ASHES_BUFF;

  buffedCasts: number = 0;
  totalCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BURN_TO_ASHES_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE),
      this.onIncinerateCast,
    );
  }

  onIncinerateCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.BURN_TO_ASHES_BUFF.id)) {
      this.buffedCasts += 1;
    }
    this.totalCasts += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS.BURN_TO_ASHES_TALENT}>
          {formatPercentage(this.buffedCasts / this.totalCasts, 0)}%{' '}
          <TooltipElement content={`${this.buffedCasts} / ${this.totalCasts}`}>
            <small>buffed Incinerate casts</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default BurnToAshes;
