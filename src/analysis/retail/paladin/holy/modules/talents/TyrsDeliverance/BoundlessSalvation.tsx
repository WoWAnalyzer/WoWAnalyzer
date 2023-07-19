import { formatDuration } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';

import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TyrsDeliverance from './TyrsDeliverance';

const BASE_DURATION_MS = 20000;

class BoundlessSalvation extends Analyzer {
  static dependencies = {
    tyrsDeliverance: TyrsDeliverance,
  };

  protected tyrsDeliverance!: TyrsDeliverance;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BOUNDLESS_SALVATION_TALENT);
    if (!this.active) {
      return;
    }
  }

  statistic() {
    const avgDuration = this.tyrsDeliverance.duration / this.tyrsDeliverance.casts;
    const avgExtension = Math.max(avgDuration - BASE_DURATION_MS, 0);
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.BOUNDLESS_SALVATION_TALENT} />
            </>
          }
        >
          {formatDuration(avgExtension)} <small>average buff extension</small>
        </BoringValueText>
      </Statistic>
    );
  }
}
export default BoundlessSalvation;
