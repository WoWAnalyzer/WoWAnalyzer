import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class SymbolsOfDeathUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  statistic() {
    const symbolsOfDeathUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.SYMBOLS_OF_DEATH.id) / this.owner.fightDuration;
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringValueText
          label={
            <>
              <SpellIcon spell={SPELLS.SYMBOLS_OF_DEATH} /> Symbols of Death Uptime
            </>
          }
        >
          {formatPercentage(symbolsOfDeathUptime)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default SymbolsOfDeathUptime;
