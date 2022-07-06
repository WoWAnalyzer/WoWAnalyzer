import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { ConvokeSpirits } from '@wowanalyzer/druid';

class ConvokeSpiritsFeral extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
  };

  // TODO also show energy and CP gained
  statistic() {
    return (
      <Statistic
        wide
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            <strong>
              Damage amount listed considers only the direct damage and non-refreshable DoT damage
              done by convoked abilities!{' '}
            </strong>
            (Non-refreshable DoTs are Starfall and Feral Frenzy) Refreshable DoTs, heals, and the
            energy and damage boost from Tiger's Fury are all not considered by this number, making
            it almost certainly an undercount of Convoke's true value.
            <br />
            <br />
            {this.baseTooltip}
          </>
        }
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spellId={SPELLS.CONVOKE_SPIRITS.id}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConvokeSpiritsFeral;
