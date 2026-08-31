import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';

const BOUNTEOUS_BLOOM_HEALING_INCREASE = 0.3;

/**
 * **Bounteous Bloom**
 * Hero Talent - Keeper of the Grove
 *
 * Your Grove Guardians' healing is increased by 30%.
 */
export default class BounteousBloom extends Analyzer {
  totalHealing = 0;
  totalOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BOUNTEOUS_BLOOM_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.GROVE_GUARDIANS_SWIFTMEND, SPELLS.GROVE_GUARDIANS_NOURISH]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.totalHealing += calculateEffectiveHealing(event, BOUNTEOUS_BLOOM_HEALING_INCREASE);
    this.totalOverhealing += calculateOverhealing(event, BOUNTEOUS_BLOOM_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.BOUNTEOUS_BLOOM_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
