import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
// import SpellIcon from 'interface/SpellIcon';
class ManifestedTwilight extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2Piece();

    if (!this.active) {
      return;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<></>}
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.MANIFESTED_TWILIGHT_BUFF_2P.id} />
            </>
          }
        ></BoringValueText>
      </Statistic>
    );
  }
}

export default ManifestedTwilight;
