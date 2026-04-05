import { ConvokeSpirits } from 'analysis/retail/druid/shared';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ConvokeSpiritsBalance extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
  };

  // TODO also astral power gained?
  statistic() {
    return (
      <Statistic
        wide
        position={STATISTIC_ORDER.CORE(8)}
        size="flexible"
        tooltip={
          <>
            <p>
              <strong>
                Damage amount listed considers only the direct damage and non-refreshable DoT damage
                done by convoked abilities!{' '}
              </strong>
              (Non-refreshable DoTs are Starfall and Feral Frenzy) Refreshable DoTs, heals, and
              Astral Power gains are all not considered by this number, making it almost certainly
              an undercount of Convoke's true value.
            </p>
            {this.baseTooltip}
          </>
        }
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpiritsBalance;
