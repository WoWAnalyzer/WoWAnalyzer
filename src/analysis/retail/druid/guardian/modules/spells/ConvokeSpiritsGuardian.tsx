import { ConvokeSpirits } from 'analysis/retail/druid/shared';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ConvokeSpiritsGuardian extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
  };

  // TODO also show rage / defensive stuff gained?
  statistic() {
    return (
      <Statistic
        wide
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>
              Damage amount listed considers only the direct damage and non-refreshable DoT damage
              done by convoked abilities!{' '}
            </strong>
            (Non-refreshable DoTs include Starfall) Refreshable DoTs and heals are not considered by
            this number, making it almost certainly an undercount of Convoke's true value.
            <br />
            <br />
            {this.baseTooltip}
          </>
        }
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpiritsGuardian;
