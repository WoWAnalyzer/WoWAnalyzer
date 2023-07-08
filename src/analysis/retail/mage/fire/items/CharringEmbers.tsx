import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import { formatPercentage } from 'common/format';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class CharringEmbers extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);
  }

  charringEmbersUptime = () => {
    const history = this.enemies.getDebuffHistory(SPELLS.CHARRING_EMBERS_DEBUFF.id);
    let uptime = 0;
    history.forEach((d) => (uptime += d.end - d.start));
    return uptime;
  };

  get uptimePercent() {
    return this.charringEmbersUptime() / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible" tooltip={<>PLACEHOLDER</>}>
        <BoringSpellValueText spell={SPELLS.CHARRING_EMBERS_DEBUFF}>
          <>
            {formatPercentage(this.uptimePercent, 2)}% <small>Charring Embers Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CharringEmbers;
