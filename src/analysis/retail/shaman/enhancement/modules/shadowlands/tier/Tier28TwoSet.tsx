import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SummonEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';

const FERAL_SPIRIT_SPELLS = [
  SPELLS.FERAL_SPIRIT_LIGHTNING_TIER,
  SPELLS.FERAL_SPIRIT_FIRE_TIER,
  SPELLS.FERAL_SPIRIT_FROST_TIER,
  SPELLS.FERAL_SPIRIT_TIER,
];

class Tier28TwoSet extends Analyzer {
  protected feralSpiritsGained = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.SL3);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.summon.spell(FERAL_SPIRIT_SPELLS).by(SELECTED_PLAYER),
      this.gainFeralSpirit,
    );
  }

  gainFeralSpirit(event: SummonEvent) {
    this.feralSpiritsGained += 1;
  }

  statistic() {
    return (
      <Statistic
        key="Statistic"
        size="small"
        position={STATISTIC_ORDER.OPTIONAL(20)}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValue
          spell={TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id}
          value={formatNumber(this.feralSpiritsGained)}
          label="Feral Spirits gained from tier set bonus"
        />
      </Statistic>
    );
  }
}

export default Tier28TwoSet;
