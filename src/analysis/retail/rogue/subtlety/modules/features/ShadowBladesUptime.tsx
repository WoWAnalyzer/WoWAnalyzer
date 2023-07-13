import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/rogue';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ShadowBladesUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  statistic() {
    const shadowBladesUptime =
      this.selectedCombatant.getBuffUptime(TALENTS.SHADOW_BLADES_TALENT.id) /
      this.owner.fightDuration;
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.SHADOW_BLADES_TALENT} /> Shadow Blades Uptime
            </>
          }
        >
          {formatPercentage(shadowBladesUptime)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ShadowBladesUptime;
