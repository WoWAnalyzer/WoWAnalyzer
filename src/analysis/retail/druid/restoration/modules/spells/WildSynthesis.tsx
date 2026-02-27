import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const WILD_SYNTHESIS_HEALING_INCREASE = 0.3; // 30% increase

/**
 * **Wild Synthesis**
 * Spec Talent Tier 7
 *
 * Grove Guardians, Efflorescence, and your other summons heal for 30% more.
 */
export default class WildSynthesis extends Analyzer {
  /** Total healing from all totems/pets (efllo + GGs + KotG summons) */
  totalHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.WILD_SYNTHESIS_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([
          SPELLS.GROVE_GUARDIANS_SWIFTMEND,
          SPELLS.GROVE_GUARDIANS_NOURISH,
          SPELLS.DRYAD_REGROWTH,
          SPELLS.DRYAD_TRANQUILITY,
          SPELLS.DRYAD_SPIRIT_OF_THE_THICKET
        ]),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.totalHealing += calculateEffectiveHealing(event, WILD_SYNTHESIS_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.WILD_SYNTHESIS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
