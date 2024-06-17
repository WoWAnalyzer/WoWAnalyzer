import { EVOKER_DF3_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringValueText from 'parser/ui/BoringValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

class T32Prevoker extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringValueText
          label={
            <>
              <ItemSetLink id={EVOKER_DF3_ID} /> (T32 tier set){' '}
            </>
          }
        >
          <>
            <h4>2 Piece</h4>
          </>
          <h4>4 piece</h4>
          <></>
          <div className="pad">{}</div>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T32Prevoker;
