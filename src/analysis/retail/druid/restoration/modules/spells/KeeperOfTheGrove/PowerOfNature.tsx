import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
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

const POWER_OF_NATURE_HEALING_INCREASE = 0.1;

const REJUV_SPELLS = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.THRIVING_VEGETATION.id,
];
const EFFLO_SPELLS = [SPELLS.EFFLORESCENCE_HEAL.id];
const LIFEBLOOM_SPELLS = [SPELLS.LIFEBLOOM_HOT_HEAL.id, SPELLS.LIFEBLOOM_BLOOM_HEAL.id];
const EVERBLOOM_SPELLS = [SPELLS.EVERBLOOM_SPLASH_HEAL.id];

/**
 * **Power of Nature**
 * Hero Talent - Keeper of the Grove
 *
 * Your Grove Guardians increase the healing of your Rejuvenation, Efflorescence, and Lifebloom by 10% while active.
 */
export default class PowerOfNature extends Analyzer {
  totalHealing = 0;
  totalOverhealing = 0;
  rejuvHealing = 0;
  effloHealing = 0;
  lifebloomHealing = 0;
  everbloomHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.POWER_OF_NATURE_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.REJUVENATION,
          SPELLS.REJUVENATION_GERMINATION,
          SPELLS.EFFLORESCENCE_HEAL,
          SPELLS.LIFEBLOOM_HOT_HEAL,
          SPELLS.LIFEBLOOM_BLOOM_HEAL,
          SPELLS.THRIVING_VEGETATION,
          SPELLS.EVERBLOOM_SPLASH_HEAL,
        ]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.POWER_OF_NATURE.id);
    if (stacks === 0) {
      return;
    }

    const healing = calculateEffectiveHealing(event, POWER_OF_NATURE_HEALING_INCREASE * stacks);
    this.totalHealing += healing;
    this.totalOverhealing += calculateOverhealing(event, POWER_OF_NATURE_HEALING_INCREASE * stacks);

    const spellId = event.ability.guid;
    if (REJUV_SPELLS.includes(spellId)) {
      this.rejuvHealing += healing;
    } else if (EFFLO_SPELLS.includes(spellId)) {
      this.effloHealing += healing;
    } else if (LIFEBLOOM_SPELLS.includes(spellId)) {
      this.lifebloomHealing += healing;
    } else if (EVERBLOOM_SPELLS.includes(spellId)) {
      this.everbloomHealing += healing;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <ul>
            {this.rejuvHealing > 0 && (
              <li>
                Rejuvenation: <strong>{this.owner.formatItemHealingDone(this.rejuvHealing)}</strong>
              </li>
            )}
            {this.effloHealing > 0 && (
              <li>
                Efflorescence:{' '}
                <strong>{this.owner.formatItemHealingDone(this.effloHealing)}</strong>
              </li>
            )}
            {this.lifebloomHealing > 0 && (
              <li>
                Lifebloom:{' '}
                <strong>{this.owner.formatItemHealingDone(this.lifebloomHealing)}</strong>
              </li>
            )}
            {this.everbloomHealing > 0 && (
              <li>
                Everbloom:{' '}
                <strong>{this.owner.formatItemHealingDone(this.everbloomHealing)}</strong>
              </li>
            )}
            <li>
              <strong>
                Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
              </strong>
            </li>
          </ul>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.POWER_OF_NATURE_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
